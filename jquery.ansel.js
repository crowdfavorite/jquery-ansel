/**
 * jQuery Ansel
 * Author: Crowd Favorite <http://crowdfavorite.com/>
 * Location: http://github.com/crowdfavorite/jquery-ansel
 * Version: 0.2
 *
 * This plugin provides backward-compatible image cropping and zooming functionality for a variety of browser to be allowed to pan and zoom images in order to select a cropped area for submission.
 * A live preview is provided and, where possible, the only data submission for the image is the cropped, panned, and zoomed section of the image. File API still currently required.
 */
if (jQuery) {
	(function($) {
		$.fn.extend({
			"ansel": function() {
				var $input = this,
					clonedArgs = Array.prototype.slice.call(arguments), // Convenient clone of arguments
					editor = $input.data("AnselEditor");
					
				if (editor === undefined) {	
					editor = (function() {
						var AnselEditor, opts;
						
						if (clonedArgs.length === 1 && typeof clonedArgs[0] == "object") {
							opts = clonedArgs[0];
						}
						else {
							opts = {};
						}
						
						AnselEditor = function(options) {
							var AnselActor, AnselStage, Ansel, _ansel,
								supports = (function() {
									var canvas = document.createElement("canvas");

									return {
										"canvas": !!(canvas.getContext && canvas.getContext('2d')), // Convert to boolean value.
										"fileapi": !!($input.get(0).files && FileReader && File) // Convert to boolean value.
									};
								})();
								
							options = $.extend({	
								"size": [100, 100],
								"container": $input.parent(),
								"moveable": true,
								"scale-output": 1,
								"zoom": true,
								"overrideHandlers": false
							}, options);
								
							AnselActor = function(imageSource, callback, suppressTriggers) {
								/**
								 * Private variables
								 */
								var _element = new Image(),
									_height = 0,
									_width = 0,
									_x = 0,
									_y = 0,
									_originalHeight = 0,
									_originalWidth = 0,
									_scale = 1,
									_minscale = 1,
									_maxscale = 1,
									suppressTriggers = !!suppressTriggers;
									
								/**
								 * Accessors and Mutators
								 */
								this.scale = function(newScale) {
									if (typeof newScale !== "undefined") {
										// Ensure we don't go beyond our limits.
										if (newScale < _minscale) {
											_scale = _minscale;
										}
										else if (newScale > _maxscale) {
											_scale = _maxscale;
										}
										else {
											_scale = newScale;
										}
										
										// Set up my height and width based on the scale.
										_height = _originalHeight * _scale;
										_width = _originalWidth * _scale;
										if (!suppressTriggers) {
											$input.trigger("ansel-scale-set", _scale);
										}
									}
									return _scale;
								};
								this.minScale = function(newScale) {
									if (typeof newScale !== "undefined") {
										_minscale = newScale;
										$input.trigger("ansel-min-scale-set", _minscale);
										if (_minscale > _maxscale) {
											_maxscale = newScale;
										}
										if (_minscale > _scale) {
											this.scale(_minscale);
										}
									}
									return _minscale;
								};
								this.maxScale = function(newScale) {
									if (typeof newScale !== "undefined") {
										_maxscale = newScale;
										$input.trigger("ansel-max-scale-set", _maxscale);
										if (_maxscale < _minscale) {
											_minscale = _maxscale;
										}
										if (_maxscale < _scale) {
											this.scale(_maxscale);
										}
									}
									return _maxscale;
								};
								this.position = function(newPosition) {
									if (
										typeof newPosition !== "undefined"
										&& typeof newPosition.x !== "undefined"
										&& typeof newPosition.y !== "undefined"
									) {
										// Set my new position.
										_x = newPosition.x;
										_y = newPosition.y;
									}
									return {
										"x": _x,
										"y": _y
									};
								};
								this.size = function() {
									return {
										"width": _width,
										"height": _height
									}
								};
								this.originalSize = function() {
									return {
										"width": _originalWidth,
										"height": _originalHeight
									}
								};
								this.element = function() {
									return _element;
								};
								
								// Load my image and set up my ready state
								_element.onload = (function(anselActor) {
									return function() {
										var imageObj = this;
										_originalHeight = imageObj.height;
										_originalWidth = imageObj.width;
										anselActor.minScale(1);
										anselActor.maxScale(1);
										anselActor.scale(1);
										anselActor.position({"x": 0, "y": 0});
										callback(anselActor);
									}
								})(this);
								_element.src = imageSource;
							};
							
							AnselStage = function(size, parentElement, suppressTriggers) {
								/**
								 * Private variables
								 */
								var _actor,
									_element;
									
								if (supports.canvas) {
									_element = $("<canvas></canvas>");
								}
								else {
									_element = $("<div></div>");
								}
									
								_element
									.css({
										"width": size[0] + "px",
										"height": size[1] + "px",
										"overflow": "hidden"
									})
									.attr({
										"width": size[0],
										"height": size[1]
									})
									.addClass("ansel-stage");
									
								if (typeof parentElement !== null) {
									_element.appendTo(parentElement);
								}
								
								_element = _element.get(0);
								
								this.suppressTriggers = !!suppressTriggers;
								
								/**
								 * Accessors and Mutators
								 */
								this.actor = function() {
									return _actor;
								};
								this.size = function() {
									return {
										"width": _element.offsetWidth,
										"height": _element.offsetHeight
									}
								};
								this.addImage = function(imageSource, callback) {
									var onActorLoaded = (function(anselStage) {
										return function(actor) {
											_actor = actor;
											anselStage.reset();
											if (!anselStage.suppressTriggers) {
												$input.trigger("ansel-image-loaded");
											}
											if (typeof callback === "function") {
												callback();
											}
										}
									})(this);
									new AnselActor(imageSource, onActorLoaded, this.suppressTriggers);
								}
								this.element = function() {
									return _element;
								};

								this.minScale = function(newScale) {
									var actor = this.actor(), scaled;
									if (typeof actor !== "undefined") {
										scaled = actor.minScale(newScale);
										if (typeof newScale !== "undefined") {
											return $input;
										}
										else {
											return scaled;
										}
									}
									return $input;
								};
								this.maxScale = function(newScale) {
									var actor = this.actor(), scaled;
									if (typeof actor !== "undefined") {
										scaled = actor.maxScale(newScale);
										if (typeof newScale !== "undefined") {
											return $input;
										}
										else {
											return scaled;
										}
									}
									return $input;
								};
								
								// Ensure we're completely cleared of any contents.
								this.clear();
							};
							$.extend(AnselStage.prototype, {
								"clear": function() {
									var element = this.element(),
										$element = $(element);
									if (supports.canvas) {
										(function(stage) {
											var ctx = element.getContext("2d");
											ctx.clearRect(0, 0, stage.offsetWidth, stage.offsetHeight);
										})(this);
									}
									else {
										$element.html("");
									}
									if (!this.suppressTriggers) {
										$input.trigger("ansel-cleared");
									}
								},
								"reset": function() {
									var actor = this.actor(),
										stageSize = this.size(),
										stageRatio = stageSize.width / stageSize.height,
										actorSize = actor.size(),
										actorOriginalSize = actor.originalSize(),
										actorRatio = actorSize.width / actorSize.height,
										minScale = 1
										element = this.element(),
										$element = $(element);
									
									// Set actor scale values
									if (actorRatio >= stageRatio) {
										// Scale by height.
										minScale = element.offsetHeight / actorOriginalSize.height;
									}
									else {
										// Scale by width.
										minScale = element.offsetWidth / actorOriginalSize.width;
									}
									this.minScale(minScale);
									this.maxScale(minScale * 4);
									this.scale(minScale);
									
									// Set actor position values
									// We'll have the actor start center stage.
									actorSize = actor.size();
									actor.position({
										"x": (element.offsetWidth - actorSize.width) / 2,
										"y": (element.offsetHeight - actorSize.height) / 2
									});
									
									// And draw the scene
									this.draw();
									if (!this.suppressTriggers) {
										$input.trigger("ansel-reset");
									}
								},
								"draw": function() {
									var actor = this.actor(),
										element = this.element(),
										actorSize,
										actorPosition,
										actorElement = actor.element();
									
									if (typeof actor == "undefined" || !actor) {
										return;
									}

									this.clear();
									
									actorSize = actor.size();
									actorPosition = actor.position();
									
									if (supports.canvas) {
										(function() {
											var ctx = element.getContext("2d");
											ctx.drawImage(actorElement, actorPosition.x, actorPosition.y, actorSize.width, actorSize.height);
										})();
									}
									else {
										(function() {
											$(actorElement).css({
												"left": actorPosition.x + "px",
												"top": actorPosition.y + "px",
												"width": actorSize.width + "px",
												"height": actorSize.height + "px",
												"position": "absolute",
											}).appendTo(element);
										})();
									}
									if (!this.suppressTriggers) {
										$input.trigger("ansel-drawn");
									}
								},
								"scale": function(newScale, atPoint) {
									var actor = this.actor(), scale, actorPosition, actorOldSize, actorNewSize, actorOnLeft, actorOnTop;
									
									if (typeof newScale !== "undefined") {
										if (typeof actor !== "undefined") {
											actorPosition = actor.position();
											actorOldSize = actor.size();
											actor.scale(newScale);
											actorNewSize = actor.size();
											if (typeof atPoint === "undefined" || typeof atPoint.x === "undefined" || typeof atPoint.y === "undefined") {
												atPoint = {
													"x": $(this.element()).width() / 2,
													"y": $(this.element()).height() / 2
												};
											}
											actorOnLeft = (atPoint.x - actorPosition.x) / actorOldSize.width;
											actorOnTop = (atPoint.y - actorPosition.y) / actorOldSize.height;
											actorPosition.x = (actorOldSize.width - actorNewSize.width) * actorOnLeft;
											actorPosition.y = (actorOldSize.height - actorNewSize.height) * actorOnTop;
											this.move(actorPosition);
											this.draw();
											if (!this.suppressTriggers) {
												$input.trigger("ansel-scale-set", newScale);
											}
										}
										return $input;
									}
									else if (typeof actor !== "undefined") {
										return actor.scale();
									}
									
									return $input;
								},
								"position": function(newPosition) {
									var actor = this.actor();
									if (typeof actor !== "undefined") {
										return this.actor().position(newPosition);
									}
									else {
										return false;
									}
								},
								"move": function(delta) {
									var actor = this.actor();
									if (typeof delta.x !== "undefined" && typeof delta.y !== "undefined") {
										if (typeof actor !== "undefined") {
											(function(stage) {
												var actorPosition = actor.position(),
													actorSize = actor.size(),
													stageSize = stage.size(),
													newPosition = {
														"x": actorPosition.x + delta.x,
														"y": actorPosition.y + delta.y
													};
												
												// Allow no whitespace on stage
												if (newPosition.x > 0) {
													newPosition.x = 0;
												}
												else if (newPosition.x + actorSize.width < stageSize.width) {
													newPosition.x = stageSize.width - actorSize.width;
												}
												if (newPosition.y > 0) {
													newPosition.y = 0;
												}
												else if (newPosition.y + actorSize.height < stageSize.height) {
													newPosition.y = stageSize.height - actorSize.height;
												}
												actor.position(newPosition);
												if (!this.suppressTriggers) {
													$input.trigger("ansel-position-set", newPosition);
												}
												stage.draw();
											})(this);
										}
									}
									return $input;
								},
								"export": function(outputScale, callback) {
									var exportData = {};
									if (typeof outputScale !== "undefined") {
										exportData.outputscale = outputScale;
									}
									else {
										exportData.outputscale = 1;
									}
									if (exportData.outputscale === 1) {
										if (supports.canvas) {
											exportData.local = true;
											exportData.image = this.element().toDataURL();
											exportData.position = {"x": 0, "y": 0};
											exportData.zoom = 1;
											exportData.size = this.size();
										}
										else {
											// TODO Write in the export pattern for non-canvas interaction.
											exportData.local = false;
											exportData.image = $input.attr("name");
											exportData.zoom = this.scale();
											exportData.position = this.position();
											exportData.size = this.size();
										}
										if (typeof callback !== "undefined") {
											callback(exportData);
										}
										else {
											$input.trigger("ansel-export", exportData);
										}
									}
									else {
										// We need to generate the scaled version with a completely separate stage.
										(function(sourceStage) {
											var srcStageSize = sourceStage.size(), newStageSize, $newStageElement, actorLoaded;
											
											newStageSize = [srcStageSize.width * exportData.outputscale, srcStageSize.height * exportData.outputscale];
											
											newStage = new AnselStage(newStageSize, null, true);
											
											$newStageElement = $(newStage.element()).css({"position": "absolute", "left": "-1000000000px", "top": "-1000000000px"});
											$newStageElement.appendTo($("body"))
											actorLoaded = function() {
												var newPosition = sourceStage.position();
												
												newPosition.x = newPosition.x * exportData.outputscale;
												newPosition.y = newPosition.y * exportData.outputscale;
												
												newStage.scale(sourceStage.scale() * exportData.outputscale);
												newStage.position(newPosition);
												
												newStage.draw();
												if (supports.canvas) {
													exportData.local = true;
													exportData.image = newStage.element().toDataURL();
													exportData.position = {"x": 0, "y": 0};
													exportData.size = newStage.size();
													exportData.zoom = 1;
												}
												else {
													// TODO Write in the export pattern for non-canvas interaction.
													exportData.local = false;
													exportData.image = $input.attr("name");
													exportData.zoom = newStage.scale();
													exportData.size = newStage.size();
													exportData.position = newStage.position();
												}
												$newStageElement.remove();
												if (typeof callback !== "undefined") {
													callback(exportData);
												}
												else {
													$input.trigger("ansel-export", exportData);
												}
											}
											newStage.addImage($(sourceStage.actor().element()).attr("src"), actorLoaded);
										})(this);
									}
								}
							});

							Ansel = function() {
								var _stage,
									_element = $("<div class=\"ansel\"></div>").css({"position": "relative", "overflow": "hidden"}),
									_zoom = 1;
								
								_element = _element.appendTo(options.container).get(0);
								_stage = new AnselStage(options.size, _element);
								
								this.stage = function() {
									return _stage;
								};
								this.element = function() {
									return _element;
								}
							};
						 	_ansel = new Ansel();
							
							this.loadImage = function(args) {
								_ansel.stage().addImage(imageUrl);
							}
							this.scale = function(args) {
								var stage = _ansel.stage(), newScale, atPoint;
								if (typeof stage !== "undefined") {
									// Convert args as possible.
									if (args.length > 1) {
										atPoint = args[1];
									}
									if (args.length > 0) {
										newScale = args[0];
									}
									if (!options.zoom) {
										return stage.scale();
									}
									return stage.scale(newScale, atPoint);
								}
								return $input;
							}
							this.minscale = function(args) {
								var stage = _ansel.stage(), newScale;
								if (typeof stage !== "undefined") {
									if (args.length > 0) {
										newScale = args[0];
									}
									if (!options.zoom) {
										return stage.scale();
									}
									return stage.minScale(newScale);
								}
								return $input;
							}
							this.maxscale = function(args) {
								var stage = _ansel.stage(), newScale;
								if (typeof stage !== "undefined") {
									if (args.length > 0) {
										newScale = args[0];
									}
									if (!options.zoom) {
										return stage.scale();
									}
									return stage.maxScale(newScale);
								}
								return $input;
							}
							this.move = function(args) {
								var stage = _ansel.stage(), delta;
								if (typeof stage !== "undefined" && options.moveable) {
									if (typeof args == "object" && typeof args.x !== "undefined" && typeof args.y !== "undefined") {
										delta = {
											"x": args.x,
											"y": args.y
										};
									}
									else if (args.length > 1) {
										delta = {
											"x": args[0],
											"y": args[1]
										};
									}
									else if (args.length > 0){
										delta = args[0];
									}
									return stage.move(delta);
								}
								return $input;
							}
							this.position = function(args) {
								var stage = _ansel.stage();
								// We don't accept arguments here. This is just returning the position.
								if (typeof stage !== "undefined") {
									return stage.position();
								}
								return undefined;
							}
							this.export = function(args) {
								var stage = _ansel.stage(), callback, outputScale;
								if (typeof stage !== "undefined") {
									// Force this into a separate thread and trigger an event on completion.
									outputScale = 1;
									if (args.length > 0) {
										outputScale = parseFloat(args[0]);
									}
									if (args.length > 1) {
										callback = args[1];
									}
									setTimeout(function() { stage.export(outputScale, callback); }, 1);
								}
								return $input;
							}
							this.options = function() {
								return options;
							}
							this.option = function(args) {
								if (args.length > 0) {
									if (typeof args[0] === "string") {
										return options[args[0]];
									}
								}
								return false;
							}
							this.supports = function(args) {
								if (args.length > 0) {
									if (typeof args[0] === "string") {
										return supports[args[0]];
									}
								}
								return false;
							}

							if (!opts.overrideHandlers) {
								(function(anselEditor) {
									var $body = $("body"),
										startDragPos = {"x": 0, "y": 0},
										update = function() {
											var updateEvent = jQuery.Event("ansel-load-file", { "canvas": supports.canvas, "fileapi": supports.fileapi });
											if (!$input.val()) {
												return;
											}
											$input.trigger(updateEvent);
											if (updateEvent.isDefaultPrevented()) {
												return;
											}
											if (updateEvent.fileapi) {
												(function() {
													// We can interact locally, so this will be easier.
													var file = $input.get(0).files, fileReader;
													if (file.length > 0) {
														file = file[0];
														if (file.type.match(/^image\/*/)) {
															fileReader = new FileReader();
															fileReader.onload = (function() {
																return function(e) {
																	_ansel.stage().addImage(e.target.result);
																}
															})();
															fileReader.readAsDataURL(file);
														}
														else {
															alert('Expected image, but received non-image data');
														}
													}	
												})();
											}
										};
										onZoom = function(e) {
											var step = 0.05,
												clicks,
												stage = _ansel.stage();
										
											if (typeof stage === "undefined") {
												return;
											}

											if (e.altKey || e.ctrlKey || e.shiftKey) {
												// This may be something special, we'll leave it alone.
												return;
											}
									
											if (e.type === "mousewheel") {
												if (e.originalEvent.wheelDeltaY === undefined) {
													// We're in IE, it merges the values into a single delta.
													clicks = e.originalEvent.wheelDelta / 120;
												}
												else {
													clicks = e.originalEvent.wheelDeltaY / 120;
												}

												if (e.originalEvent.offsetX !== null) {
													centerZoom = {
														"x": e.originalEvent.offsetX,
														"y": e.originalEvent.offsetY
													};
													// Because in non-canvas the image has an absolute position, we need to normalize this value.
													centerZoom = (function(e, centerZoom) {
														var offsetPosition = $(e.originalEvent.target).position();
														centerZoom.x += offsetPosition.left;
														centerZoom.y += offsetPosition.top;
														return centerZoom;
													})(e, centerZoom);
												}
											}
											else {
												return;
											}
									
											e.preventDefault();
											e.stopPropagation();

											if (clicks !== 0) {
												stage.scale(stage.scale() + (clicks * step), centerZoom);
											}
										},
										drag = function(e) {
											var newPosition = {"x": 0, "y": 0},
												positionDelta = {"x": 0, "y": 0};
												
											e.stopPropagation();
											e.preventDefault();
											if (e.type === "mousemove") {
												newPosition.x = e.screenX;
												newPosition.y = e.screenY;
											}
											else if (e.type === "touchmove") {
												newPosition.x = e.originalEvent.touches[0].screenX;
												newPosition.y = e.originalEvent.touches[0].screenY;
											}
											else {
												return;
											}
											positionDelta.x = newPosition.x- startDragPos.x;
											positionDelta.y = newPosition.y - startDragPos.y;
											anselEditor.move(positionDelta);
											startDragPos = newPosition;
										},
										startDrag = function(e) {
											if (e.type === "mousedown" && e.button === 0) {
												startDragPos = {
													"x": e.screenX,
													"y": e.screenY
												};
											}
											else if (e.type === "touchstart" && e.originalEvent.touches.length === 1) {
												startDragPos = {
													"x": e.originalEvent.touches[0].screenX,
													"y": e.originalEvent.touches[0].screenY
												};
											}
											else {
												return;
											}
											e.preventDefault();
											e.stopPropagation();
											$body.on("mousemove touchmove", drag);
										};
								
									$input.on("change", update);
									$element = $(_ansel.element());
									if (options.draggable) {
										$element
											.on("mousedown touchstart", startDrag)
											.css({
												"cursor": "move"
											});
										$body.on("mouseup mouseleave touchend touchleave", function(e) {
											$body.off("mousemove touchmove", drag);
										});
									}
									if (options.zoom) {
										$element
											.on("mousewheel", onZoom);
									}
									update();
								})(this);
							}
						};
						return new AnselEditor(opts);
					})();
					$input.data("AnselEditor", editor);
					$input.trigger("ansel-initialized");
					return $input;
				}
				if (clonedArgs.length > 0 && typeof clonedArgs[0] == "string") {
					// We're calling one of the internal functions.
					return (function(args) {
						var callName = args.shift(), retval;
						if (typeof editor[callName] == "function") {
							return editor[callName](args);
						}
						return $input;
					})(clonedArgs);
				}
				return $input;
			}
		})
	})(jQuery);
}
else {
	console && console.warn && console.warn('jQuery Ansel not loaded because jQuery is not detected');
};
