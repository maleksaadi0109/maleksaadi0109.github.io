# Throw Launcher website

This repository contains the static download website for Throw Launcher.

## Run

Use the **Website** workflow, or run:

```sh
python3 -m http.server 5000 --bind 0.0.0.0
```

The site uses plain HTML, CSS, and JavaScript without build dependencies. The same files can be served by a static host such as GitHub Pages. No secrets or database are required.

## Product sources

- Source and documentation: https://github.com/maleksaadi0109/throw-launcher
- Installer: https://github.com/maleksaadi0109/throw-launcher/releases/latest/download/Throw-Launcher-Setup-x64.exe
- Original logo: upstream `branding/`; its MIT license is retained in `assets/THROW-LICENSE.txt`.

The launcher is a native Rust Windows x64 application. The current installer is unsigned preview software; preserve that disclosure. Do not claim a guaranteed memory footprint, a verified publisher signature, or support for other operating systems.

The website's launcher demonstration is illustrative and must not be presented as access to the visitor's installed applications or files.
