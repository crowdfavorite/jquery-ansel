/**
 * jQuery Ansel
 * Author: Crowd Favorite <http://crowdfavorite.com/>
 * Location: http://github.com/crowdfavorite/jquery-ansel
 * Version: 0.1
 *
 * This plugin provides backward-compatible image cropping and zooming functionality for a variety of browser to be allowed to pan and zoom images in order to select a cropped area for submission.
 * A live preview is provided and, where possible, the only data submission for the image is the cropped, panned, and zoomed section of the image. Fallbacks where the JavaScript File API are not available still post full image to the server first.
 */
if (jQuery) {
	(function($) {
		$.fn.extend({
			"ansel": function() {
				var $input = this, // The input
					clonedArgs = Array.prototype.slice.call(arguments), // Convenient clone of arguments
					ansel = (function($input, args) {
						var editor = $input.data("Ansel"),
							opts = {};
						if (typeof editor === "undefined") {
							var Ansel = function(opts) {
								// Private settings
								this._zoom = 1;
								this._active = false;
								this._wrapper = $("<div />");
								this._stage;
								this._actor;
								this._data;
								this._supports = (function() {
									var supportObj = {
										"canvas": false,
										"fileapi": false,
										"drag": false
									};
									
									// Detect Canvas support
									var canvasTest = document.createElement('canvas');
									supportObj.canvas = !!(canvasTest.getContext && canvasTest.getContext('2d'));
									
									// Detect drag support
									supportObj.drag =
										!!((supportObj.canvas && window.Kinetic && window.Kinetic.Stage && window.Kinetic.Layer)
										|| (!supportObj.canvas)); // We'll implement dragging manually for non-canvas functionality.
										
									// Detect File API
									supportObj.fileapi =
										!!($input.get(0).files && FileReader && File); // Convert to boolean value.
										
									return supportObj;
								})();
								this._options = $.extend({
									"size": [100, 100],
									"container": $input.parent(),
									"name": "jq_edited_image",
									"draggable": this._supports.drag,
									"scale": 1,
									"zoom": false
								}, opts);
								
								// Override invalid options
								if (this._options.draggable && this._supports.canvas && !this._supports.drag) {
									console && console.warn && console.warn('KineticJS not detected, falling back to non-canvas interface for drag support');
									this._supports.canvas = false;
								};
								
								
								// Event handlers
								this._handlers = {
									"onInputUpdate": function() {
										// This is a convenience wrapper to set the image for display.
										// Event context will be the attached input
										$(this).ansel("update");
									}
								}
								
								// Private functions
								this._private = {
									"parent": this,
									"clearStage": function() {
										// Functionality to clear the stage of existing images
										if (this.parent._supports.canvas && this.parent._supports.drag) {
											// Use KineticJS to clear the stage
											this.parent._stage.clear();
										}
										// Temporarily disabled as not yet implemented
										/*
										else if (this._supports.canvas) {
											
										}*/
										else {
											this.parent._stage.html("");
										}
									},
									"addToStage": function(imageUrl) {
										// Functionality to add an image to the stage based on the URL given
										if (this.parent._supports.canvas && this.parent._supports.drag) {
											// Use KineticJS to draw
											var me = this.parent;
											(function() {
												var img = new Image(),
												 	draw = function(imageObj) {
														var kineticImage;
														
														if (me._actor) {
															me._actor.destroy();
														}
														
														me._actor = new Kinetic.Layer();
														
														kineticImage = new Kinetic.Image({
											          		image: imageObj,
											          		x: (me._stage.getWidth() - imageObj.width) / 2,
											          		y: (me._stage.getHeight() - imageObj.height) / 2,
											          		width: imageObj.width,
											          		height: imageObj.height,
											          		draggable: me._options.draggable
														});
														
														if (me._options.draggable) {
											        		// add cursor styling
											        		kineticImage.on('mouseover', function() {
											          			document.body.style.cursor = 'move';
											        		});
															// remove cursor styling
											        		kineticImage.on('mouseout', function() {
											          			document.body.style.cursor = 'default';
											        		});
														}
														me._actor.add(kineticImage);
														me._stage.add(me._actor);
														
														// With zoom support, set the default zoom to the furthest out possible to fill the area.
														if (me._options.zoom) {
															var heightMin = me._stage.getHeight() / imageObj.height;
															var widthMin = me._stage.getWidth() / imageObj.width;
															var minZoom = heightMin;
															if (widthMin > heightMin) {
																minZoom = widthMin;
															}
															if (minZoom !== 1) {
																$input.ansel("zoom", minZoom);
															}
														}
														
														$input.trigger("image-loaded");
													};
												
												img.onload = (function() {
													draw(this);
												});
												
												img.src = imageUrl;
											})();
										}
										// Temporarily disabled for future implementation
										/*else if (this._supports.canvas) {
											// Manually draw without KineticJS
										}*/
										else {
											// We need to update the stage manually.
										}
									}
								}
								
								this.supports = function(myArgs) {
									if (myArgs.length === 1) {
										return this._supports[myArgs[0]];
									}
									else {
										return this._supports;
									}
								}
								this.option = function(myArgs) {
									var optionName, optionVal;
									if (myArgs.length === 0) {
										return undefined;
									}
									optionName = myArgs.shift();
									return this._options[optionName];
								};
								this.options = function() {
									return this._options;
								};
								this.zoom = function(myArgs) {
									if (myArgs.length === 0) {
										return this._zoom;
									}
									else {
										// Handle zoom based on browser support and features.
										if (!this._options.zoom) {
											console && console.warn && console.warn("Tried to change zoom level on non-zoomable image editor");
										}
										else {
											this._zoom = myArgs[0];
											// Update the stage based on this zoom change
											if (this._supports.canvas && this._supports.drag) {
												var image = this._actor.getChildren();
												(function() {
													if (this._stage && this._stage.getChildren().length > 0) {
														if (this._actor.getChildren().length > 0) {
															this._actor.remove();
															image = this._actor.getChildren()[0];
															var imageHeight = image.getHeight();
															var imageWidth = image.getWidth();
															var imageScale = image.getScale().x;
															heightBefore = imageHeight * imageScale;
															widthBefore = imageWidth * imageScale;
															var heightAfter = imageHeight * this._zoom;
															var widthAfter = imageWidth * this._zoom;
															var heightDelta = heightAfter - heightBefore;
															var widthDelta = widthAfter - widthBefore;
															positionBefore = image.getPosition();
															// Scale the image
															image.setScale(this._zoom);
															image.setPosition(positionBefore.x - (widthDelta / 2), positionBefore.y - (heightDelta / 2));
															this._stage.add(this._actor);
														}
													}
												}).call(this);
											}
											// Disabled as not yet implemented.
											/*else if (this._supports.canvas) {
												
											}*/
											else {
												// Not yet implemented.
											}
											
											// Update the stored zoom level
											this._zoom = myArgs[0];
										}	
										return $input;
									}
								};
								this.export = function(args) {
									var exportHandler;
									if (args.length === 0) {
										return $input;
									}
									exportHandler = args.shift();
									if (this._supports.canvas && this._supports.drag) {
										if (this._options.scale == 1) {
											// We don't have to scale anything, just return this stage output
											this._stage.toDataURL({
												callback: function(dataUrl) {
													exportHandler({
														"type": "canvas-export",
														"data": dataUrl
													})
												}
											});
										}
										else {
											// We have to clone our existing stage as a different size.
											(function() {
												var $tempWrapper = $("<div style=\"display:none\"></div>").appendTo("body"),
													tempStage = new Kinetic.Stage({
														"container": $tempWrapper.get(0),
														"width": (this._options.size[0] * this._options.scale),
														"height": (this._options.size[1] * this._options.scale)
													}),
													clonedLayer = this._actor.clone();
												
												clonedLayer.setScale(clonedLayer.getScale().x * this._options.scale);
												tempStage.add(clonedLayer);
												tempStage.toDataURL({
													callback: function(dataUrl) {
														exportHandler({
															"type": "canvas-export",
															"data": dataUrl
														});
													}
												})
											}).call(this);
										}
									}
									return $input;
								}
								this.update = function() {
									var imageUrl;
									// We need to clear the stage.
									this._private.clearStage();
									
									if (this._supports.fileapi) {
										// We can interact locally, so this will be easier.
										var file = $input.get(0).files, fileReader;
										if (file.length > 0) {
											file = file[0];
											if (file.type.match(/^image\/*/)) {
												fileReader = new FileReader();
												fileReader.onload = (function(editor) {
													return function(e) {
														editor._private.addToStage(e.target.result);
													}
												})(this);
												fileReader.readAsDataURL(file);
											}
											else {
												alert('Expected image, but received non-image data');
											}
										}
									}
									else {
										// This will need server-side handling via an AJAX call and response not yet defined.
									}
									return $input;
								};
								this.start = function() {
									if (!this._active) {
										$input.data("Ansel", this);
									
										// Set up display
										this._wrapper.appendTo(this._options.container);
									
										// From here we need to build the stage based on browser support and features.
										if (this._supports.canvas && this._supports.drag) {
											// We'll use KineticJS to render the stage
											this._stage = new Kinetic.Stage({
												container: this._wrapper.get(0),
												width: this._options.size[0],
												height: this._options.size[1]
											});
										}
										// Temporarily disabled for future implementation
										/*else if (this._supports.canvas) {
											// We don't have KineticJS, but we don't need drag controls either
										}*/
										else {
											// We don't have canvas support, so we need to custom-build the stage using standard markup.
										}
										
										// Add change listener
										$input.on("change", this._handlers.onInputUpdate);
										
										// Update the display, should a file already be selected.
										this.update();
										
										// Set this as active.
										this._active = true;
									}
									return $input;
								};
								this.stop = function() {
									if (this._active) {
										$input.data("Ansel", null);
										
										// Remove the display
										this._wrapper.remove();
										
										// Remove change listener
										$input.off("change", this._handlers.onInputUpdate);
										//Set as inactive
										this._active = false;
									}
									return $input;
								};
								
								this.restart = function() {
									this.stop();
									this.start();
									return $input;
								}
								this.start();
							};
							if (args.length == 1 && typeof args[0] === "object") {
								opts = args[0];
							}
							editor = new Ansel(opts);
						}
						return editor;
					})($input, arguments);
					if (arguments.length > 0) {
						// We're looking to call a function on the Ansel.
						var call = clonedArgs.shift();
						if (ansel && typeof ansel[call] === "function") {
							return ansel[call](clonedArgs);
						}
						else {
							return $input;
						}
					}
			}
		})
	})(jQuery);
}
else {
	console && console.warn && console.warn('jQuery Ansel not loaded because jQuery is not detected');
}
