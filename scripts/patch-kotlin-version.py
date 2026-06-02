"""
Alinha a versao do Kotlin para resolver o conflito Kotlin/Compose Compiler.

Causa raiz:
- O build.gradle raiz define ext.kotlinVersion com default '1.9.25'.
- expo-modules-core usa esse valor para escolher o Compose Compiler via
  versionsMap: "1.9.24"->"1.5.14", "1.9.25"->"1.5.15".
- Mas o @react-native/gradle-plugin (RN 0.76.x) fixa o kotlin-gradle-plugin
  em 1.9.24. Como o classpath em build.gradle nao fixa versao, o Kotlin real
  e 1.9.24, mas o Compose Compiler escolhido era 1.5.15 (exige 1.9.25) -> erro.

Correcao: forcar android.kotlinVersion=1.9.24 em gradle.properties. Assim:
- ext.kotlinVersion = 1.9.24
- Compose Compiler = 1.5.14 (exige Kotlin 1.9.24)
- kotlin-gradle-plugin = 1.9.24
Tudo consistente.
"""

KOTLIN_VERSION = "1.9.24"
PROPS_PATH = "android/gradle.properties"

with open(PROPS_PATH, "r") as f:
    lines = f.readlines()

# Remove qualquer definicao previa (de execucoes anteriores) e reescreve.
filtered = [ln for ln in lines if not ln.strip().startswith("android.kotlinVersion=")]

if filtered and not filtered[-1].endswith("\n"):
    filtered[-1] += "\n"

filtered.append(f"android.kotlinVersion={KOTLIN_VERSION}\n")

with open(PROPS_PATH, "w") as f:
    f.writelines(filtered)

print(f"Set android.kotlinVersion={KOTLIN_VERSION} em {PROPS_PATH}")
print("--- gradle.properties (ultimas linhas) ---")
print("".join(filtered[-5:]))
