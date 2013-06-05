/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */
exports.PolyPathGCodeTools = {};
var PolyPathGCodeTools = exports.PolyPathGCodeTools;

	//similar to drawPolyPath() but generates a gcode program
exports.PolyPathGCodeTools.gcodeFromPolyPath = function(polyPath) {
		var gcode = '';
		function appendLine(str) {
			gcode += str + '\n';
		}
		function appendComment(str) {
			appendLine('( '+str+' )');
		}
		function appendCommand(args) {
			var cmdStr = args.cmd;
			for (var n in args) {
				if (n != 'cmd') {
					cmdStr += ' '+n;
					if (Math.round(args[n]).toString() == args[n].toString())
						cmdStr += (n+'.0');
					else
						cmdStr += n.toString();
				}
			}
		}
		
		var xOffset = 0; -1 * (ConfigParams.CAM_X / 2);
		var yOffset = 0; -1 * (ConfigParams.CAM_Y / 2);

		appendComment('Generated by robotcontrol');
		appendComment('');

		var fDrawing = 900; // feed rate while drawing
		var fTraveling = 3000; // feed rate while traveling

		var zDrawing = 0; // Z axis for drawing moves (mm)
		var zTraveling = 100; // Z axis for travel moves (mm)

		var eDrawing = 1; // (e)xtruder setting while drawing
		var eTraveling = 0; // (e)xtruder setting while traveling

		// preamble
		appendComment('prepare machine state');

		appendCommand({
			cmd: 'G92',
			e:0
		}); // reset extruder
		appendCommand({ cmd: 'G90' }); // absolute coordinate system
		appendCommand({ cmd:'M82' }); // absolute mode for extruder, too
		appendCommand({ cmd:'G21' }); // units are mm
		appendCommand({ cmd:'G92', e:0.0 }); // reset extruder again... not sure why this is needed, but most gcode does this

		appendComment('beginning of drawing');
		for(var i = 0; i < polyPath.length; i ++){
			appendComment('beginning of line segment '+i+' of '+polyPath.length);
			var path = polyPath[i];
			appendCommand({
				cmd:'G1',
				z:zTraveling,
				f:fTraveling
			});
			var point = null;
			for(var j = 0; j < path.length; j ++){
				point = path[j];

				if (j == 0) {
					//first point on a new path, so move the tool above the drawing point but above the workpiece
					appendCommand({
						cmd:'G1',
						x:(point.x+xOffset),
						y:(point.y+yOffset),
						z:zTraveling,
						f:fTraveling
					});
				}
				appendCommand({
					cmd:'G1',
					x:(point.x+xOffset),
					y:(point.y+yOffset),
					z:zDrawing,
					f:fDrawing
				});
			}
			if (point != null) {
				//end of line, raise the tool
				appendCommand({
					cmd:'G1',
					x:(point.x+xOffset),
					y:(point.y+yOffset),
					z:zTraveling,
					f:fTraveling
				});
			}
			appendComment('end of line segment '+i+' of '+polyPath.length);
		}
		appendComment('end of drawing');
		return gcode;
	};
