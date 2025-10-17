# Git Fork and Sync Workflow Guide

This guide details the best practice for maintaining your personal fork of an external repository (like `raydium-io/raydium-sdk-V2`), allowing you to commit your own changes while easily pulling in updates from the original creator.

## 1. Fork the Original Repository

Go to the original repository on GitHub and click the **"Fork"** button. This creates a copy under your personal account.

## 2. Clone Your Fork Locally and Set Up Remotes

You need to clone your new fork and then add a reference to the original repo (the "upstream") for pulling updates.

1.  **Clone Your Fork:**
    (Replace `<YOUR_GITHUB_USERNAME>` with your actual username)

    ```bash
    git clone [https://github.com/](https://github.com/)<YOUR_GITHUB_USERNAME>/raydium-sdk-V2.git
    cd raydium-sdk-V2
    ```

2.  **Add the Original Repo as 'Upstream':**
    This registers the original creator's repository.

    ```bash
    git remote add upstream [https://github.com/raydium-io/raydium-sdk-V2](https://github.com/raydium-io/raydium-sdk-V2)
    ```

3.  **Verify Remotes:**
    Confirm you have both `origin` (your fork) and `upstream` (the original repo).

    ```bash
    git remote -v
    ```

## 3. Work and Push Your Changes

Always push your personal modifications to your own fork, which is the `origin` remote.

1.  **Make your changes, then commit:**
    ```bash
    git add .
    git commit -m "My personal modifications and preferences"
    ```

2.  **Push to your fork:**
    (Assuming your primary branch is `main` or `master`)

    ```bash
    git push origin main
    ```

## 4. Pull Updates from the Original (Upstream)

When you want to merge in the latest updates from the original creator:

1.  **Fetch the latest data from the upstream remote:**

    ```bash
    git fetch upstream
    ```

2.  **Merge the updates into your current branch:**
    (Using `main` as the example branch name)

    * **Option A: Merge (Creates a merge commit)**
        ```bash
        git merge upstream/main
        ```
    * **Option B: Rebase (For cleaner, linear history - recommended)**
        ```bash
        git pull --rebase upstream main
        ```

3.  **Push the synchronized code back to your own fork:**
    This updates your GitHub fork with the upstream changes *and* your own modifications.

    ```bash
    git push origin main
    ```
