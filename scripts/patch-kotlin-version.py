import re

with open('android/build.gradle', 'r') as f:
    content = f.read()

patterns = [
    r'(kotlinVersion\s*=\s*["\'])([^"\']+)(["\'])',
    r'(kotlin_version\s*=\s*["\'])([^"\']+)(["\'])',
]

modified = False
for pattern in patterns:
    new_content = re.sub(pattern, r'\g<1>1.9.25\3', content)
    if new_content != content:
        content = new_content
        modified = True
        print("Patched kotlinVersion to 1.9.25 in android/build.gradle")

if not modified:
    print("kotlinVersion not found in build.gradle, adding to gradle.properties")
    with open('android/gradle.properties', 'a') as f:
        f.write('\nkotlin.version=1.9.25\n')
    print("Added kotlin.version=1.9.25 to android/gradle.properties")
else:
    with open('android/build.gradle', 'w') as f:
        f.write(content)

print("Kotlin version patch complete")
