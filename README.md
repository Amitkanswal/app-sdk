# App Framework SDK

## JSON Rich text editor plugin

The **JSON Rich Text Editor Plugins** lets you add/create custom plugins to extend the functionality of your [JSON Rich Text Editor](https://www.contentstack.com/docs/developers/json-rich-text-editor/about-json-rich-text-editor/) as per your needs. You can use the prebuilt JSON RTE plugins by modifying the code to suit your requirement.

Some of the examples of the prebuilt JSON Rich Text Editor plugins are:

-   Highlight: Allows you to highlight certain parts of your content, such as a whole line of text or a paragraph.

-   Info Panel: Allows you to place important content inside a colored panel to make it stand out.

-   Word Count: Allows you to track the word count for your JSON Rich Text Editor content.

You can create JSON Rich Text Editor Plugins using the Contentstack App SDK. For more information, read our [documentation](https://www.contentstack.com/docs/developers/json-rich-text-editor-plugins/about-json-rte-plugins/).

## Asset Sidebar Extension

**Asset Sidebar Extensions** enable you to customize and enhance your **asset editing experience**. Using customized extensions, you can tailor your images on Contentstack according to your branding requirements..

You can create Asset Sidebar Extensions using the Contentstack App SDK. For more information, read our documentation.

### AssetSidebarWidget Reference

It is an object representing the current Asset Sidebar Widget reference in the Contentstack UI.

**getData()**

This method returns the object representing the current asset.

**setData(asset: Partial<AssetData>)**

This method modifies the properties of the current asset.

**syncAsset()**

If your asset has been modified externally, you can use this method to load the new asset and sync its settings with the current asset.

**updateWidth(width: number)**

This method is used to modify the width of the asset sidebar panel. Using this method, you can resize the panel depending on the resolution of your content.

**replaceAsset(file: File)**

This method is used to replace the current asset with a new file. Unlike setData(), where you can only modify the properties, you can use this method to replace the actual file.

**onSave(callback: anyFunction)**

This is a callback function that runs after you save the asset settings.

**onChange(callback: anyFunction)**

This is a callback function that runs every time the user modifies the asset data.

**onPublish(callback: anyFunction)**

This is a callback function that is executed after a user publishes an asset.

**onUnPublish(callback: anyFunction)**

This is a callback function that is executed after you unpublish an asset.

**AssetData**

It is the property that you can modify using the setData() method.
