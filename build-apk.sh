#!/bin/bash

echo "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ"
echo "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ"
echo ""
echo "🚀 Building DREAM OS APK v1.0.0..."

# 1. Create Android directory structure
echo "📁 Creating Android project structure..."
mkdir -p android/app/src/main/{java/com/dreamos/school,res/{drawable,values,mipmap-xxxhdpi}}

# 2. Copy all Android files
echo "📄 Copying Android configuration files..."
cp AndroidManifest.xml android/app/src/main/
cp strings.xml android/app/src/main/res/values/
cp styles.xml android/app/src/main/res/values/
cp ic_launcher.xml android/app/src/main/res/drawable/
cp MainActivity.java android/app/src/main/java/com/dreamos/school/
cp build.gradle android/app/
cp proguard-rules.pro android/app/
cp file_paths.xml android/app/src/main/res/xml/

# 3. Generate icons
echo "🎨 Generating app icons..."
convert -background '#075E54' -fill '#FFD700' -font "Brush-Script-MT" \
  -pointsize 200 label:"𝓓" -trim +repage -resize 512x512 \
  android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# 4. Generate splash screen
echo "🖼️ Creating splash screen..."
convert -size 1080x1920 xc:'#075E54' \
  -font "Brush-Script-MT" -pointsize 180 -fill '#FFD700' \
  -gravity center -annotate +0+0 "𝓓" \
  -font "Amiri" -pointsize 40 -fill 'white' \
  -gravity south -annotate +0+100 "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ" \
  android/app/src/main/res/drawable/splash.png

# 5. Build APK
echo "🏗️ Building APK..."
cd android
./gradlew clean
./gradlew assembleRelease

# 6. Check if build successful
if [ -f app/build/outputs/apk/release/app-release-unsigned.apk ]; then
    echo "✅ APK built successfully!"
    
    # Sign APK
    echo "🔐 Signing APK..."
    
    # Create keystore if not exists
    if [ ! -f dreamos.keystore ]; then
        keytool -genkey -v \
            -keystore dreamos.keystore \
            -alias dreamos \
            -keyalg RSA \
            -keysize 2048 \
            -validity 10000 \
            -dname "CN=DREAM OS, OU=School Management, O=Al Fikri, C=ID" \
            -storepass dreamos_2025 \
            -keypass dreamos_2025
    fi
    
    # Sign the APK
    jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
        -keystore dreamos.keystore \
        -storepass dreamos_2025 \
        -keypass dreamos_2025 \
        app/build/outputs/apk/release/app-release-unsigned.apk \
        dreamos
    
    # Align APK
    echo "📐 Aligning APK..."
    zipalign -v 4 \
        app/build/outputs/apk/release/app-release-unsigned.apk \
        dream-os-v1.0.0.apk
    
    # APK Info
    echo ""
    echo "📊 APK INFORMATION:"
    echo "===================="
    echo "File: dream-os-v1.0.0.apk"
    echo "Size: $(du -h dream-os-v1.0.0.apk | cut -f1)"
    echo "SHA-256: $(sha256sum dream-os-v1.0.0.apk | cut -d' ' -f1)"
    echo "Version: 1.0.0"
    echo "Version Code: 10000"
    echo "Package: com.dreamos.school"
    echo "Min SDK: 21 (Android 5.0)"
    echo "Target SDK: 34 (Android 14)"
    
    # Move APK to root
    mv dream-os-v1.0.0.apk ../
    
    echo ""
    echo "🎉 APK BUILD COMPLETED SUCCESSFULLY!"
    echo "📱 File: dream-os-v1.0.0.apk"
    
else
    echo "❌ APK build failed!"
    echo "Check the build logs above for errors."
    exit 1
fi

echo ""
echo "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ"
echo "بِسْمِ اللهِ مَا شَاءَ اللهُ"
