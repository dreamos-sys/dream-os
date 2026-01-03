#!/bin/bash

echo "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ"
echo "🚀 Building DREAM OS APK..."

# 1. Clean previous builds
rm -rf android/app/build
rm -rf dream-os.apk

# 2. Generate signing key (if not exists)
if [ ! -f dreamos.keystore ]; then
    echo "🔑 Creating signing key..."
    keytool -genkey -v \
        -keystore dreamos.keystore \
        -alias dreamos \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -dname "CN=DREAM OS, OU=School Management, O=Al Fikri, C=ID"
fi

# 3. Build APK
echo "🏗️ Building APK..."
./gradlew assembleRelease

# 4. Verify APK
if [ -f android/app/build/outputs/apk/release/app-release.apk ]; then
    echo "✅ APK built successfully!"
    cp android/app/build/outputs/apk/release/app-release.apk dream-os.apk
    
    # 5. APK Info
    echo "📊 APK Information:"
    echo "   Size: $(du -h dream-os.apk | cut -f1)"
    echo "   Version: 1.0.0"
    echo "   Package: com.dreamos.school"
    
else
    echo "❌ APK build failed!"
    exit 1
fi

echo ""
echo "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ"
echo "🎉 DREAM OS APK ready for distribution!"
