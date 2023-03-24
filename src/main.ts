import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Stat, TFile } from 'obsidian';
import { ulid } from 'ulid'
interface ULIDManagerSettings {
    enableManager: boolean
    frontmatterUlidKey: string
    enableFillEmptyKey: boolean
    enableUseCreationTime: boolean
    enableConditionalKeyInsertion: boolean
    frontmatterConditionalKey: string
}

const DEFAULT_SETTINGS: ULIDManagerSettings = {
    enableManager: false,
    frontmatterUlidKey: "uid",
    enableFillEmptyKey: false,
    enableUseCreationTime: true,
    enableConditionalKeyInsertion: false,
    frontmatterConditionalKey: "modified",
}

export default class ULIDManager extends Plugin {
    settings: ULIDManagerSettings;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new ULIDManagerSettingTab(this.app, this))

        this.addCommand({
            id: "insert-ulid-cursor",
            name: "Insert ULID at Cursor",
            editorCallback: (editor: Editor) => {
                editor.replaceRange(ulid(), editor.getCursor())
            },
        })

        this.registerEvent(this.app.vault.on("modify", async (file: TFile) => {
            if(!this.settings.enableManager) {
                // Don't do anything if we've disabled automatic management
                return
            }

            if(!this.settings.enableFillEmptyKey && !this.settings.enableConditionalKeyInsertion) {
                // Don't do anything if all of our individual automatic insertion
                // settings have been disabled
                return
            }

            // The key we're going to use for storing the ULID
            const ulidKey = this.settings.frontmatterUlidKey
            // The variable holding our new ULID
            let newUlid: string = ulid()

            // Get the file's creation time if we want to use that for ULID timestamps
            if (this.settings.enableUseCreationTime) {
                const stat = await this.app.vault.adapter.stat(file.path)
                const fileCreationTime = stat?.ctime

                if(fileCreationTime !== undefined) {
                    newUlid = ulid(fileCreationTime)
                }
            }

            this.app.fileManager.processFrontMatter(file, (frontmatter) => {
                if(Object.keys(frontmatter).length == 0) {
                    // If our note doesn't have any frontmatter, we want to bail out.
                    return
                }

                const ulidValue = frontmatter[ulidKey]
                if(ulidValue !== undefined) {
                    if(ulidValue === "" || ulidValue == null || ulidValue === "null") {
                        frontmatter[ulidKey] = newUlid
                    }
                } else {
                    if(this.settings.enableConditionalKeyInsertion) {
                        const conditionalKey = this.settings.frontmatterConditionalKey

                        if(frontmatter[conditionalKey] !== undefined) {
                            frontmatter[ulidKey] = newUlid
                        }
                    }
                }
            })
        }))
    }

    onunload() {

    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class ULIDManagerSettingTab extends PluginSettingTab {
    plugin: ULIDManager;

    constructor(app: App, plugin: ULIDManager) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();
        containerEl.createEl('h2', { text: 'Universally Unique Lexicographically Sortable Identifier (ULID) Manager' });

        new Setting(containerEl)
            .setName('Enable Automatic ULID Management')
            .setDesc('Enable the automatic ULID management features of this plugin.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableManager)
                .onChange(async (value) => {
                    this.plugin.settings.enableManager = value;
                    await this.plugin.saveSettings();
                })
            )

        new Setting(containerEl)
            .setName('Use creation time instead of current time')
            .setDesc(
                'When enabled, the plugin will use the creation time of the note '+
                'to generate the timestamp portion of the ULID. When disabled, '+
                'the plugin will use the current time. This setting only affects '+
                'ULIDs that are automatically managed by this plugin; it does not '+
                'affect ULIDs that are inserted into the body of the note using a command.'
            )
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableUseCreationTime)
                .onChange(async (value) => {
                    this.plugin.settings.enableUseCreationTime = value;
                    await this.plugin.saveSettings();
                })
            )

        containerEl.createEl('h2', { text: 'Frontmatter ULID Management' })

        new Setting(containerEl)
            .setName('ULID Field key')
            .setDesc('The key to manage for the ULID in the frontmatter of a note.')
            .addText(text => text
                .setPlaceholder('Enter the key to manage')
                .setValue(this.plugin.settings.frontmatterUlidKey)
                .onChange(async (value) => {
                    this.plugin.settings.frontmatterUlidKey = value;
                    await this.plugin.saveSettings();
                })
            )

        new Setting(containerEl)
            .setName('Empty Key Filling')
            .setDesc(
                'When enabled, this plugin will automatically insert a ULID into the '+
                'specified key of the frontmatter of a note when that note is modified. ' +
                'The ULID will be automatically inserted into the key if the key contains an empty string, '+
                'null, or the string "null."'
            )
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableFillEmptyKey)
                .onChange(async (value) => {
                    this.plugin.settings.enableFillEmptyKey = value;
                    await this.plugin.saveSettings();
                })
            )

        new Setting(containerEl)
            .setName('Conditional Key Insertion')
            .setDesc(
                'When enabled, the plugin will automatically insert a ULID at the "ULID Key" '+
                'specified above when the key specified below is present in the frontmatter of a note '+
                'and the ULID Key is not present.'
            )
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableConditionalKeyInsertion)
                .onChange(async (value) => {
                    this.plugin.settings.enableConditionalKeyInsertion = value;
                    await this.plugin.saveSettings();
                })
            )

        new Setting(containerEl)
            .setName('Conditional Insertion Trigger Key')
            .setDesc('The presence of this key will trigger the insertion of a ULID at the "ULID Key" field in the frontmatter.')
            .addText(text => text
                .setPlaceholder('Enter the key to look for')
                .setValue(this.plugin.settings.frontmatterConditionalKey)
                .onChange(async (value) => {
                    this.plugin.settings.frontmatterConditionalKey = value;
                    await this.plugin.saveSettings();
                })
            )
    }
}
