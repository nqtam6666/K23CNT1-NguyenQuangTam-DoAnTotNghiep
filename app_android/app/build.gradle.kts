plugins {
  alias(libs.plugins.android.application)
}

android {
  namespace = "com.example.smartclassai"
  compileSdk {
    version = release(37)
  }

  defaultConfig {
    applicationId = "com.example.smartclassai"
    minSdk = 24
    targetSdk = 34
    versionCode = 1
    versionName = "1.0"

    testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
  }

  buildFeatures {
    viewBinding = true
  }

  buildTypes {
    release {
      optimization {
        enable = true
        packageScope = setOf("androidx.**", "kotlin.**", "kotlinx.**")
      }
    }
  }
  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
  }
}

dependencies {
  implementation(libs.activity.ktx)
  implementation(libs.appcompat)
  implementation(libs.constraintlayout)
  implementation(libs.material)
  implementation(libs.swiperefreshlayout)
  implementation(libs.recyclerview)
  implementation(libs.cardview)
  implementation(libs.retrofit)
  implementation(libs.converter.gson)
  implementation(libs.okhttp)
  implementation(libs.logging.interceptor)
  implementation(libs.gson)
  testImplementation(libs.junit)
  androidTestImplementation(libs.espresso.core)
  androidTestImplementation(libs.ext.junit)
}
