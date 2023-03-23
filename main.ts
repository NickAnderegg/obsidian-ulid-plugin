import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
interface ULIDManagerSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: ULIDManagerSettings = {
	mySetting: 'default'
}

export default class ULIDManager extends Plugin {
	settings: ULIDManagerSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ULIDManagerSettingTab(this.app, this));

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
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Universally Unique Lexicographically Sortable Identifier (ULID) Manager'});

	}
}
