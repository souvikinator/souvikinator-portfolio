---
title: 'Change npm Release Tag After Publishing (dist-tags)'
date: 2025-03-09T00:00:00+05:30
draft: false
tags: ['npm', 'javascript', 'package-management', 'versioning']
description: 'Quick guide to update an npm release tag like `latest` to `alpha` after publishing'
image: './cover.png'
---

Mistakenly tagged a version as `latest` on npm? Here's how to fix it with dist-tags:

1. **Tag the Version as `alpha`:**
   Assign the `alpha` tag to the mistaken version. For example, if your package is `my-package` and version `1.0.1` was incorrectly tagged:

   ```bash
   npm dist-tag add my-package@1.0.1 alpha
   ```

2. **Update `latest` to the Stable Version:**
   Point `latest` to the correct stable version, like `1.0.0`:

   ```bash
   npm dist-tag add my-package@1.0.0 latest
   ```

3. **Verify the Tags:**
   Check the updated tags for `my-package`:
   ```bash
   npm dist-tag ls my-package
   ```
   Output might look like:
   ```
   alpha: 1.0.1
   latest: 1.0.0
   ```

Keep your package versions clear and user-friendly with these simple steps!
