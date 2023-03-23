import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { ulid } from 'ulid'
interface ULIDManagerSettings {
    enableManager: boolean
    frontmatterUlidKey: string
    enableFillEmptyKey: boolean
    enableUseCreationTime: boolean
    // enableFrontmatterInsertionOnOpen: boolean
    // enableFrontmatterInsertionOnSave: boolean
}

const DEFAULT_SETTINGS: ULIDManagerSettings = {
    enableManager: false,
    frontmatterUlidKey: "uid",
    enableFillEmptyKey: false,
    enableUseCreationTime: true,
    // enableFrontmatterInsertionOnOpen: false,
    // enableFrontmatterInsertionOnSave: false,
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
            .setName('Enable ULID Manager')
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

        new Setting(containerEl)
            .setName('ULID Key')
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
            .setName('Enable Empty Key Filling')
            .setDesc(
                'When enabled, this plugin will automatically insert a ULID into an '+
                'empty key found in the frontmatter of a note when that note is opened or created.'
            )
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableFillEmptyKey)
                .onChange(async (value) => {
                    this.plugin.settings.enableFillEmptyKey = value;
                    await this.plugin.saveSettings();
                })
            )
    }
}
