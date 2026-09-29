# Sklapa public/index.html iz src/app.html + biblioteke (ZXing, JsBarcode, jsPDF) u jedan fajl.
# Pokretanje: python3 build.py  (biblioteke se preuzimaju sa npm-a)
import subprocess, tempfile, os, tarfile, glob
LIBS = [("@zxing/library@0.23.0", "package/umd/index.min.js"),
        ("jsbarcode@3.12.3", "package/dist/JsBarcode.all.min.js"),
        ("jspdf@4.2.1", "package/dist/jspdf.umd.min.js")]
tmp = tempfile.mkdtemp(); parts = []
for spec, path in LIBS:
    out = subprocess.check_output(["npm", "pack", spec, "--silent"], cwd=tmp, text=True).strip().splitlines()[-1]
    with tarfile.open(os.path.join(tmp, out)) as t:
        parts.append(t.extractfile(path).read().decode())
s = open("src/app.html", encoding="utf-8").read()
inl = "\n".join("<script>\n" + p.replace("</script", "<\\/script") + "\n</script>" for p in parts)
open("public/index.html", "w", encoding="utf-8").write(s.replace("<!--LIBS-->", inl))
print("public/index.html ok")
