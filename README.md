# ULID Manager

This is an Obsidian Plugin for automatically inserting ULIDs into the frontmatter of your notes. A Universally Unique Lexicographically Sortable Identifier (ULID) is a 26 character, case-insensitive, URL-safe, base32 encoded string that can replace UUIDs.

This plugin uses the canonical [ulid](https://github.com/ulid/javascript) library for JavaScript to generate ULIDs. According to the [original specification](https://github.com/ulid/spec), a ULID consists of a 48-bit timestamp and an 80-bit cryptographically-secure random value, which is then encoded into a 26 character string using Cockford's base32 encoding. The end result is a 128 bit value (making it compatible with UUIDs) that is sortable by creation time and is also unique.

Take, for example, the following ULIDs, which were all generated in quick succession:

```text
01GWAFN9Q9HBHPWBQH1JFTXKKY
01GWAFN9Q9ABE9XMKEDGWM44DJ
01GWAFN9Q9D161G0N7Z5N5BNZR
01GWAFN9Q9SRQS2410H4B3RQSE
01GWAFN9Q9EN6153A8E9CR7WV2
01GWAFN9Q9QC4AQQ02HDEPNZP7
01GWAFN9Q9NZHKMJ78GC4STEGJ
01GWAFN9Q90F8B3SCV69748XG5
01GWAFN9Q9F4B2BQHZSWVTTZKR
```

The first 10 characters of each ULID are `01GWAFN9Q9`, indicating that each of these ULIDs was generated at `2023-03-24T18:56:23Z`. The remaining 16 characters of each ULID are random, ensuring that each generated identifier is unique.

In this way, ULIDs can serve as a drop-in replacement for UUIDs, but with the added benefit of encoding the creation time metadata into the identifier itself.

## Usage and Settings

When `Automatic ULID Management` is enabled, this plugin can be configured to insert a ULID automatically into the frontmatter of a note upon modification. By default, the timestamp portion of the ULID is generated using the creation time of the current file, but this can be overridden by disabling `Use creation time instead of current time`.

### Frontmatter ULID Management

The primary purpose of this plugin is to automatically insert a ULID into a given field in each note's frontmatter. The conditions that can trigger the insertion of a ULID can be configured in a few different ways.

Most importantly, the `ULID Field key` setting determines which frontmatter metadata field should contain a ULID. By default, this is the `uid` field, which is the default key used by the [Obsidian Advanced URI](https://vinzent03.github.io/obsidian-advanced-uri/concepts/file_identifiers#key-in-frontmatter) plugin.

#### Empty Key Filling

To enable maximum compatibility with other plugins and templating systems, this plugin offers an *Empty Key Filling* feature, which will only automatically insert a ULID into a note if the ULID Field key is present in the frontmatter and is empty (one of these values: `null`, `""`, or `"null"`).

This setting is disabled by default, but you can turn it on by enabling `Empty Key Filling` in the plugin settings. Here is an example of the frontmatter of a note that would be automatically assigned a ULID with this setting enabled:

```yaml
---
uid: ""
title: Some Note
---
```

When this file is modified and the ULID Manager plugin is automatically trigger, the `uid` field will be filled with a new ULID:

```yaml
---
uid: 01GWAGWVTACM0VA02H7D4W4GT9
title: Some Note
---
```

If the `Use creation time instead of current time` setting is enabled, the timestamp portion of the ULID will reflect the creation time of the file; otherwise, it will reflect the time the timestamp was generated.

#### Conditional Key Insertion

If you would like to insert a ULID into a note that does not already contain an empty ULID Field in the frontmatter, you can enable *Conditional Key Insertion* to automatically insert a ULID when another field (specified by `Conditional Insertion Trigger Key`) is present in the frontmatter.

This setting is disabled by default, but you can turn it on by enabling `Conditional Key Insertion` in the plugin settings. Here is an example of the frontmatter of a note that would receive a ULID assignment when `Conditional Key Insertion` is enabled and `Conditional Insertion Trigger Key` is set to `modified`:

```yaml
---
modified: 2023-03-20T10:20:58
title: Some Note
---
```

When this file is modified and the plugin is active, a `uid` field will be inserted and filled with a new ULID:

```yaml
---
uid: 01GBAH29NC2FTYW3NYCEX2EGQK
modified: 2023-03-24T19:20:58
title: Some Note
---
```

### Compatibility with Other Plugins

The purpose of the *Empty Key Filling* and *Conditional Key Insertion* features is to allow this plugin to avoid interfering with other plugins that may be managing a note's metadata.

To ensure future compatibility with Obsidian and other plugins, the following restrictions should be observed when developing this plugin further:

- This plugin should never automatically modify the value in the ULID Field unless it is empty.
- This plugin should never automatically modify or overwrite the value in any other field in the frontmatter.
- This plugin should never attempt to modify a note that doesn't already contain a frontmatter block.
