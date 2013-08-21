# README

## INSTALLATION

### REQUIREMENTS

- jQuery 1.8 or newer
- jQuery UI 1.10.3 or newer
- KineticJS 4.5.4 or newer
- jQuery UI TouchPunch (for touch-device drag/zoom support)

## USAGE

### Invocation

` $("input[type=\"file\"]#ansel-image").ansel([options]) `

### Function Reference

#### `ansel([options])`
 - Calling with no parameters will initialize the ansel object using default values.
 - Options are as follows, passed in as an object of key-value pairs.
   - `size` : `[height, width]` - The height and width of the ansel element in the page. Default `[100,100]`
   - `container` : `jQuery element` - Where to draw the Ansel editor. Default parent of input element.
   - `name` : `string` - The input name to pass to the server containing the edited image. Defaults to `jq_edited_image`
   - `draggable` : `boolean` - Whether the user should be able to drag the image. Defaults to capability to drag image in browser.
   - `scale` : `float` - What scale the image data sent to the server should be, relative to `size`. Default: `1`
   - `zoom` : `boolean` - Whether to allow the image to be zoomed in/out. Default `false`. **No inherent zoom functionality included.**

#### `ansel("supports"[, capability])`
 - Calling with no second parameter provides all supports features.
 - Calling with second parameter returns boolean value whether the ansel editor supports that feature in this browser.

#### `ansel("option", optionname)`
 - Returns the value of the requested option. Returns undefined if option not defined.

#### `ansel("options")`
 - Returns the key-value set of options used for this instance of Ansel.

#### `ansel("zoom"[, zoomlevel])`
 - If no parameters are provided, returns the current zoom level of the Ansel editor.
 - If zoomlevel is provided, and zoom is supported, zooms the editor to that level and returns that value.

#### `ansel("export", exportHandler)`
 - Triggers an asynchronous call to generate the data URL for the visible data within the Ansel editor and calls the exportHandler passed in upon completion.

#### `ansel("update")`
 - Triggers Ansel to load the image from the attached element and update the editor interface.

#### `ansel("start")`
 - Initial setup of the Ansel editor used internally. Can be called after the "stop" command in order to re-initialize.

#### `ansel("stop")`
 - Shuts down and de-initializes the Ansel editor.

#### `ansel("restart")`
 - Calls "stop" and then "start" in sequence to restart the Ansel editor.