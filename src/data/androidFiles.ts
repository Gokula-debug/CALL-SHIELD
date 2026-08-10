import { AndroidCodeFile } from '../types';

export const ANDROID_FILES: AndroidCodeFile[] = [
  {
    id: 'manifest',
    path: 'app/src/main/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    category: 'Manifest',
    description: 'Declares Android system permissions (Phone state, Call log, Answer calls, Internet) and registers Foreground Service & Call Receiver.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.callshield.app">

    <!-- Permissions required for phone call interception and network API communication -->
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.READ_CALL_LOG" />
    <uses-permission android:name="android.permission.ANSWER_PHONE_CALLS" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="CallShield"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.CallShield">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- BroadcastReceiver listens for incoming phone state changes -->
        <receiver
            android:name=".receiver.CallReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.PHONE_STATE" />
            </intent-filter>
        </receiver>

        <!-- Foreground Service processes incoming spam checks without being killed by Android OS -->
        <service
            android:name=".service.CallBlockerService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="phoneCall" />

    </application>
</manifest>`
  },
  {
    id: 'gradle',
    path: 'app/build.gradle.kts',
    filename: 'build.gradle.kts',
    category: 'Gradle',
    description: 'Build configuration including Retrofit REST client, Gson converter, Room Database, and Kotlin Coroutines.',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    id("kotlin-kapt")
}

android {
    namespace = "com.callshield.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.callshield.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")

    // Retrofit & OkHttp for REST API calls
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Room Database for local offline cache
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    kapt("androidx.room:room-compiler:$roomVersion")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}`
  },
  {
    id: 'receiver',
    path: 'app/src/main/java/com/callshield/app/receiver/CallReceiver.kt',
    filename: 'CallReceiver.kt',
    category: 'Receiver',
    description: 'Intercepts incoming telephony broadcast events and triggers CallBlockerService with the caller number.',
    code: `package com.callshield.app.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager
import android.util.Log
import com.callshield.app.service.CallBlockerService

/**
 * CallReceiver handles incoming telephony state broadcasts.
 * When an incoming call starts (RINGING), it reads the caller number and starts CallBlockerService.
 */
class CallReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == TelephonyManager.ACTION_PHONE_STATE_CHANGED) {
            val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
            val incomingNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)

            Log.d(TAG, "Phone State Changed: $state | Number: $incomingNumber")

            if (state == TelephonyManager.EXTRA_STATE_RINGING && !incomingNumber.isNull_orEmpty()) {
                val serviceIntent = Intent(context, CallBlockerService::class.java).apply {
                    putExtra("INCOMING_NUMBER", incomingNumber)
                }
                context.startForegroundService(serviceIntent)
            }
        }
    }

    companion object {
        private const val TAG = "CallShield_Receiver"
    }
}`
  },
  {
    id: 'service',
    path: 'app/src/main/java/com/callshield/app/service/CallBlockerService.kt',
    filename: 'CallBlockerService.kt',
    category: 'Service',
    description: 'Foreground service that queries backend API /api/calls/check, rejects spam calls using TelecomManager, and saves logs.',
    code: `package com.callshield.app.service

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.telecom.TelecomManager
import android.util.Log
import androidx.core.app.NotificationCompat
import com.callshield.app.R
import com.callshield.app.api.CallShieldApiClient
import com.callshield.app.api.SpamCheckRequest
import com.callshield.app.db.AppDatabase
import com.callshield.app.db.CallLogEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * CallBlockerService runs in foreground when a call is ringing.
 * It checks the caller number against CallShield REST API and auto-rejects if identified as spam.
 */
class CallBlockerService : Service() {

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val incomingNumber = intent?.getStringExtra("INCOMING_NUMBER") ?: return START_NOT_STICKY

        startForeground(NOTIFICATION_ID, createNotification("Analyzing $incomingNumber..."))

        CoroutineScope(Dispatchers.IO).launch {
            try {
                // 1. Query CallShield Backend REST API
                val response = CallShieldApiClient.api.checkSpam(SpamCheckRequest(phoneNumber = incomingNumber))

                if (response.isSuccessful && response.body() != null) {
                    val spamResult = response.body()!!
                    Log.d(TAG, "Spam Check Result: Score \${spamResult.score}, Spam: \${spamResult.spam}")

                    if (spamResult.spam || spamResult.score >= 70) {
                        // 2. Reject Spam Call automatically using TelecomManager
                        rejectCall()
                        logToBackend(incomingNumber, spamResult.score, "BLOCKED", "ANDROID_APP")
                        saveLocalLog(incomingNumber, spamResult.score, "BLOCKED")
                    } else {
                        logToBackend(incomingNumber, spamResult.score, "SAFE", "ANDROID_APP")
                        saveLocalLog(incomingNumber, spamResult.score, "SAFE")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to connect to CallShield backend: \${e.message}")
            } finally {
                stopSelf()
            }
        }

        return START_NOT_STICKY
    }

    private fun rejectCall() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            val telecomManager = getSystemService(Context.TELECOM_SERVICE) as TelecomManager
            try {
                telecomManager.endCall()
                Log.i(TAG, "Call automatically rejected by CallShield!")
            } catch (e: SecurityException) {
                Log.e(TAG, "Missing ANSWER_PHONE_CALLS permission: \${e.message}")
            }
        }
    }

    private suspend fun saveLocalLog(number: String, score: Int, status: String) {
        val db = AppDatabase.getInstance(applicationContext)
        db.callLogDao().insert(
            CallLogEntity(
                phoneNumber = number,
                timestamp = System.currentTimeMillis(),
                spamScore = score,
                status = status,
                source = "ANDROID_APP"
            )
        )
    }

    private suspend fun logToBackend(number: String, score: Int, status: String, source: String) {
        try {
            CallShieldApiClient.api.logCall(
                mapOf(
                    "phoneNumber" to number,
                    "spamScore" to score,
                    "status" to status,
                    "source" to source
                )
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error logging to remote backend: \${e.message}")
        }
    }

    private fun createNotification(contentText: String): Notification {
        val channelId = "callshield_channel"
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "CallShield Protection", NotificationManager.IMPORTANCE_LOW)
            manager.createNotificationChannel(channel)
        }

        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("CallShield Active")
            .setContentText(contentText)
            .setSmallIcon(R.drawable.ic_shield)
            .build()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        private const val TAG = "CallBlockerService"
        private const val NOTIFICATION_ID = 101
    }
}`
  },
  {
    id: 'api',
    path: 'app/src/main/java/com/callshield/app/api/CallShieldApi.kt',
    filename: 'CallShieldApi.kt',
    category: 'API',
    description: 'Retrofit interface definitions for backend endpoints: checkSpam, logCall, fetchBlacklist, fetchStats.',
    code: `package com.callshield.app.api

import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

data class SpamCheckRequest(
    val phoneNumber: String
)

data class SpamCheckResponse(
    val phoneNumber: String,
    val spam: Boolean,
    val score: Int,
    val riskLevel: String,
    val reasons: List<String>,
    val recommendation: String,
    val matchedBlacklist: Boolean
)

interface CallShieldApi {

    @POST("api/calls/check")
    suspend fun checkSpam(@Body request: SpamCheckRequest): Response<SpamCheckResponse>

    @POST("api/calls/log")
    suspend fun logCall(@Body logData: Map<String, Any>): Response<Map<String, Any>>

    @GET("api/blacklist")
    suspend fun getBlacklist(): Response<List<Map<String, Any>>>
}

object CallShieldApiClient {
    // Configurable base URL pointing to Node.js backend
    var BASE_URL = "https://your-callshield-backend.onrender.com/"

    val api: CallShieldApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(CallShieldApi::class.java)
    }
}`
  },
  {
    id: 'db',
    path: 'app/src/main/java/com/callshield/app/db/AppDatabase.kt',
    filename: 'AppDatabase.kt',
    category: 'Database',
    description: 'Android Room Database storing call logs locally on device for offline access.',
    code: `package com.callshield.app.db

import android.content.Context
import androidx.room.*

@Entity(tableName = "call_logs")
data class CallLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val phoneNumber: String,
    val timestamp: Long,
    val spamScore: Int,
    val status: String,
    val source: String
)

@Dao
interface CallLogDao {
    @Query("SELECT * FROM call_logs ORDER BY timestamp DESC")
    suspend fun getAllLogs(): List<CallLogEntity>

    @Insert
    suspend fun insert(log: CallLogEntity)

    @Query("DELETE FROM call_logs")
    suspend fun clearAll()
}

@Database(entities = [CallLogEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun callLogDao(): CallLogDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "callshield_db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}`
  },
  {
    id: 'activity',
    path: 'app/src/main/java/com/callshield/app/MainActivity.kt',
    filename: 'MainActivity.kt',
    category: 'Activity',
    description: 'Primary UI activity displaying active shield toggle, runtime permission request handler, and recent call log feed.',
    code: `package com.callshield.app

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

/**
 * MainActivity handles UI setup and runtime permission requests required for phone interception.
 */
class MainActivity : AppCompatActivity() {

    private val REQUIRED_PERMISSIONS = arrayOf(
        Manifest.permission.READ_PHONE_STATE,
        Manifest.permission.READ_CALL_LOG,
        Manifest.permission.ANSWER_PHONE_CALLS
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        checkAndRequestPermissions()
    }

    private fun checkAndRequestPermissions() {
        val missingPermissions = REQUIRED_PERMISSIONS.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missingPermissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(
                this,
                missingPermissions.toTypedArray(),
                PERMISSION_REQUEST_CODE
            )
        } else {
            Toast.makeText(this, "CallShield Protection Active!", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                Toast.makeText(this, "All Permissions Granted!", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "CallShield needs permissions to detect spam calls.", Toast.LENGTH_LONG).show()
            }
        }
    }

    companion object {
        private const val PERMISSION_REQUEST_CODE = 200
    }
}`
  }
];
