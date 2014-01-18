var FFI = require('node-ffi'),
	util = require('util'),
	user32 = new FFI.Library('user32', {
		mouse_event: ['void', ['uint', 'uint', 'uint', 'int', 'ulong']],
		keybd_event: ['void', ['byte', 'byte', 'uint', 'ulong']],
		GetSystemMetrics: ['int', ['int']],
		GetMessageExtraInfo: ['ulong', []]
	});

function Mouse(point, action, data) {
	if (point) {
		action |= Mouse.Action._Move;
		if (!point.is_relative) {
			action |= Mouse.Action._Absolute;
		}
		if (!point.no_prepare) {
			point.x *= 0x10000 / user32.GetSystemMetrics(0);
			point.y *= 0x10000 / user32.GetSystemMetrics(1);
		}
	} else {
		point = {x: 0, y: 0};
	}
	user32.mouse_event(action, point.x, point.y, data, user32.GetMessageExtraInfo());
}

Mouse.Action = {
	/* inner-user { */
	_Move:      0x0001,
	_Absolute:  0x8000,
	/* } inner-used */
	Wheel:     0x0800,
	Left: {
		Down:  0x0002,
		Up:    0x0004,
		Click: 0x0002 | 0x0004
	},
	Right: {
		Down:  0x0008,
		Up:    0x0010,
		Click: 0x0008 | 0x0010
	},
	Middle: {
		Down:  0x0020,
		Up:    0x0040,
		Click: 0x0020 | 0x0040
	}
};

['Left', 'Right', 'Middle'].forEach(function(button) {
	var actions = Mouse.Action[button];
	var method = Mouse[button] = function(point) { Mouse(point, actions.Click) };
	['Down', 'Up'].forEach(function(state) {
		method[state] = function(point) { Mouse(point, actions[state]) }
	})
});

Mouse.Wheel = function(amount) { Mouse(null, Mouse.Action.Wheel, amount) }

function Keyboard() {
	Keyboard.Down.apply(Keyboard, arguments);
	Array.prototype.reverse.call(arguments);
	Keyboard.Up.apply(Keyboard, arguments);
}

Keyboard.Do = function(keyCodes, action) {
	if (!keyCodes.length) {
		keyCodes = [keyCodes];
	}
	Array.prototype.forEach.call(keyCodes, function(keyCode) { user32.keybd_event(keyCode, 0, action, user32.GetMessageExtraInfo()) });
}

Keyboard.Down = function() {
	Keyboard.Do(arguments, 0);
}

Keyboard.Up = function() {
	Keyboard.Do(arguments, 2);
}

module.exports = {
	Mouse:    Mouse,
	Keyboard: Keyboard
}