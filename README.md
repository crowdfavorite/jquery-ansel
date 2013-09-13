# README

## INSTALLATION

### REQUIREMENTS

- jQuery 1.8 or newer
- jQuery UI 1.10.3 or newer

## USAGE

### Invocation

` $("input[type=\"file\"]#ansel-image").ansel([options]) `

### Function Reference

#### `ansel([options])`
 - Calling with no parameters will initialize the ansel object using default values.
 - Options are as follows, passed in as an object of key-value pairs.
	- `size`: Array [width, height] specifying the editor dimensions. Default `[100, 100]`
	- `container`: DOMElement to contain the editor. Default: input parent
	- `moveable`: Whether the image should be moveable within the editor. Default `true`.
	- `scale-output`: The output scale of the editor relative to the editor's size. Default `1`
	- `zoom`: Whether to allow zooming in the editor. Default `true`
	- `overrideHandlers`: Used to disable default move/zoom/update functionality to use alternate implementations. Default `false`

#### `ansel("supports"[, capability])`
 - Calling with no second parameter provides all supports features.
 - Calling with second parameter returns boolean value whether the ansel editor supports that feature in this browser.
 - Recognized values of "capability" are "canvas" and "fileapi".

#### `ansel("option", optionname)`
 - Returns the value of the requested option. Returns undefined if option not defined.

#### `ansel("options")`
 - Returns the key-value set of options used for this instance of Ansel.

#### `ansel("loadImage", imageSrc)`
 - Causes the ansel editor to clear the stage and load the new imageSrc provided as an editable image.

#### `ansel("scale"[, newScale])`
 - If no parameters are provided, returns the current scale of the Ansel editor.
 - If newScale is provided, and zoom is supported, zooms the editor to that level and returns that value.

#### `ansel("minscale"[, newScale])`
 - If no parameters are provided, returns the current minimum scale of the Ansel Editor.
 - If newScale is provided, and zoom is supported, sets the minimum scale to that level, sets the maximum scale equal if this value is greater than maximum scale, and sets the current scale to this level if the current scale is lower.

#### `ansel("maxscale"[, newScale])`
 - If no parameters are provided, returns the current maximum scale of the Ansel Editor.
 - If newScale is provided, and zoom is supported, sets the maximum scale to that level, sets the minimum scale equal if this value is less than the minimum scale, and sets the current scale to this level if the current scale is higher.

#### `ansel("move", {"x": deltaX, "y": deltaY})`
 - If the image is moveable, will shift the image by deltaX horizontally, and deltaY vertically.

#### `ansel("position")`
 - Returns the current position in the following format `{"x": posX, "y": posY}`

#### `ansel("export", exportHandler)`
 - Triggers an asynchronous call to generate the data URL for the visible data within the Ansel editor and calls the exportHandler passed in upon completion.
 - Calls exportHandler with response object
	`
	{
		"local": (boolean) Whether the image data is provided with the event or should be pulled from the input value. True means image data is included.
		"image": (string) Data URL when local is true, otherwise name of the parent input that would contain image data.
		"zoom": (float) The output zoom level of the source image.
		"position": (object {"x": float, "y": float}) The position of the top-left corner of the image relative to the top-left corner of the editor.
		"size": (object {"width": float, "height": float}) The width and height of the export box.
		"outputscale": (float) How much the output is scaled relative to the size of the editor. Data in "zoom", "position", and "size" already account for this scalar.
	}
	`

### Event Reference

#### `("ansel-image-loaded")`
 - Fired when an image has completed loading into the Ansel Editor and is ready for display.

#### `("ansel-cleared")`
 - Fired when the editor is cleared, usually done before redrawing.

#### `("ansel-min-scale-set", minScale)`
 - Fired when the minimum scale of the editor is set to a new value. minScale data provided is the new minimum scale value.

#### `("ansel-min-scale-set", maxScale)`
 - Fired when the maximum scale of the editor is set to a new value. maxScale data provided is the new maximum scale value.

#### `("ansel-scale-set", scale)`
 - Fired when the current scale of the editor is set to a new value. scale data provided is the new scale value.

#### `("ansel-reset")`
 - Fired when the editor is reset to default values.

#### `("ansel-drawn")`
 - Fires when the editor redraws its interface. This happens on any update to the editor.

#### `("ansel-position-set", newPosition)`
 - Updates when the image position has been changed in the editor. newPosition value will be in `{"x": posX, "y": posY}` format.

#### `("ansel-export", exportData)`
 - Fires when the ansel data is exported, if no callback function was provided. exportData matches format described in "export" function above.

## NOTES

**Ansel does not provide any inherent server interaction functionality, but provides hooks to do so. If you wish to accept submitted content, or extend support to not use the File API, you will need to write integrations using the functions above with your personal server environment. Pinch-zoom functionality for multi-touch devices is also currently not supported natively.**