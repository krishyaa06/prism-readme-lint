<!-- ═════════════ HEADER ═════════════ -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:07060f,50:00D2FF,100:3DDC97&height=200&section=header&text=Prism%20README%20Lint&fontSize=48&fontColor=ffffff&animation=fadeIn&fontAlignY=36&desc=Lint%20%26%20grade%20your%20README&descAlignY=58&descSize=16" width="100%" alt="Prism README Lint" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=19&duration=2600&pause=800&color=00D2FF&center=true&vCenter=true&width=680&lines=readmelint;Grade%3A+A+%C2%B7+100%2F100;%E2%9C%96+Anchor+%23setup+not+found;--min+80+in+CI" alt="Typing SVG" />
</p>

<p align="center">
  <a href="https://github.com/krishyaa06/prism-readme-lint/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/krishyaa06/prism-readme-lint/ci.yml?branch=main&style=for-the-badge&label=CI&logo=githubactions&logoColor=white" alt="CI" /></a>
  <img src="https://img.shields.io/badge/Node.js-%E2%89%A518.17-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/dependencies-0-00D2FF?style=for-the-badge" alt="Zero dependencies" />
  <a href="LICENSE"><img src="https://img.shields.io/github/license/krishyaa06/prism-readme-lint?style=for-the-badge&color=3DDC97" alt="License" /></a>
</p>

<p align="center">
  <img src="assets/screenshots/demo.png" width="90%" alt="Prism README Lint screenshot" />
</p>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" width="100%" alt="" />

## ⚡ Overview

**Prism README Lint** (`readmelint`) is a quick health check for the most important file in your repo. It gives the README an **A–F grade** and points at exactly what to fix: links to files that don't exist, images that 404, `#anchors` that don't match any heading (using GitHub's slug rules), missing Install / Usage / License sections, heading level jumps, images without alt text, unclosed code blocks and leftover `TODO` / `lorem ipsum`. Use `--min 80` to keep it an A in CI.

## ✨ Features

- **A–F grade** + score out of 100 (errors −12, warnings −5, tips −1)
- **Broken links & images**: relative files are checked on disk; `#anchors` checked against GitHub-style heading slugs
- **Structure**: title, description, Install / Usage / License / Contributing sections, heading jumps, duplicate headings
- **Accessibility**: images (Markdown and `<img>`) without alt text, vague "click here" links
- **Code blocks**: unclosed fences, missing language tags. Content inside code is never linted
- `--min <score>` for CI, `--quiet`, `--json`, `--no-files`. Zero dependencies

## 🚀 Quick Start

```bash
# run without installing
npx github:krishyaa06/prism-readme-lint 

# or install globally
npm install -g github:krishyaa06/prism-readme-lint
readmelint --min 80
```

Requires Node.js 18.17+. No dependencies.

## 🛠️ Usage

```text
readmelint [file|dir] [options]

    --min <score>    exit 1 if the score is below this (default 0, CI: 80)
    --quiet          only errors
    --no-files       don't check that linked files exist
    --json           machine-readable output
```

### Rules

| Level | Rules |
|---|---|
| error | `title`, `broken-link`, `missing-image`, `broken-anchor`, `empty-link`, `unclosed-fence` |
| warn | `missing-install`, `missing-usage`, `missing-license`, `heading-jump`, `multiple-h1`, `image-alt`, `placeholder`, `too-short`, `no-code`, `localhost-link` |
| tip | `missing-contributing`, `fence-lang`, `link-text`, `no-visual`, `http-link` |

### In CI

```yaml
- run: npx --yes github:krishyaa06/prism-readme-lint --min 80
```

## 📁 Project Structure

```text
prism-readme-lint/
├── assets/
│   ├── logo.png
│   └── logo.svg
├── bin/
│   └── readmelint.js   # CLI entry
├── examples/
│   ├── good/   # an A-grade README
│   │   ├── assets/
│   │   │   └── logo.svg
│   │   └── README.md
│   └── bad-README.md   # every mistake
├── src/
│   ├── index.js   # markdown scanner + rules + score
│   └── ui.js   # colours, tables
├── test/
│   └── readmelint.test.js
├── .gitignore
├── LICENSE
├── README.md
└── package.json
```

## 🧪 Tests

```bash
npm test
```

Tests use the built-in `node:test` runner, so there is nothing to install. CI runs them on Node 20 and 22.

## 🤝 Contributing

1. Fork the repo and create a branch: `git checkout -b feature/my-idea`
2. Make your change and add a test in `test/`
3. Run `npm test` and open a Pull Request

## 🔷 Part of Prism Protocol

Prism README Lint is one of the open-source tools built by [Prism Protocol](https://dc.gg/prismprotocol), a tech community where young builders learn, ship and compete together.

## 👤 Author

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/krishyaa06"><img src="https://github.com/krishyaa06.png" width="90" style="border-radius:50%" alt="Soumya Bhandare" /><br><b>Soumya Bhandare</b></a><br>
      <sub>Founder @ Prism Protocol</sub>
    </td>
    <td>
      <a href="https://dc.gg/prismprotocol"><img src="https://img.shields.io/badge/Discord-Prism%20Protocol-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord" /></a><br>
      <a href="https://instagram.com/prism_protocol_"><img src="https://img.shields.io/badge/Instagram-@prism__protocol__-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" /></a><br>
      <a href="https://x.com/krishyaa06"><img src="https://img.shields.io/badge/X-@krishyaa06-000000?style=for-the-badge&logo=x&logoColor=white" alt="X" /></a>
    </td>
  </tr>
</table>

## 📄 License

Released under the [MIT License](LICENSE).

<p align="center">
  <b>If you like this project, consider giving it a ⭐</b><br>
  <sub>"Build. Create. Compete." · Made with ⚡ by Prism Protocol</sub>
</p>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:3DDC97,50:00D2FF,100:07060f&height=110&section=footer" width="100%" alt="" />
