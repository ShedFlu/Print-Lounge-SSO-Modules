# Print Lounge SSO Modules

This repository contains multi-language modules for integrating the Print Lounge SSO Interface (v.2). 
Each module provides a consistent API for generating secure login URLs and IFrames using AES encryption (aes-128-cbc, aes-192-cbc, aes-256-cbc).

## Repository Structure

- `/docs`: Contains the SSO specification and detailed documentation.
- `/js`: JavaScript / Node.js implementation.
- `/php`: PHP implementation.

## How to Consume

Depending on your project's technology, you can consume only the module you need.

### 1. JavaScript / Node.js (via npm)
You can install the JavaScript module directly from GitHub into your `package.json`:
```bash
npm install github:user/repo-name#path:js
```

### 2. PHP (via Composer)
You can add this repository to your `composer.json` using the [composer-git-subfolder-plugin](https://github.com/vaimo/composer-git-subfolder-plugin) or by defining it as a VCS repository.

### 3. Sparse Checkout (Git 2.25+)
If you only want to clone a specific subfolder (e.g., `php`) without downloading the entire repository history:
```bash
git clone --depth 1 --filter=blob:none --sparse <repository-url>
git sparse-checkout set php
```

### 4. Direct Download (using degit)
A fast way to get only the code from a subfolder:
```bash
npx degit user/repo-name/js
```

---

## Technical Specifications
For detailed information on the SSO interface, parameters, and encryption requirements, please refer to:
- [English Documentation](docs/SSO-v.2-en.md)
- [German Documentation](docs/SSO-v.2.md)
