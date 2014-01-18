var
user32 = new FFI.Library('user32', {
	GetDC: ['ulong', ['ulong']],
	GetSystemMetrics: ['int', ['int']]
}),
gdi32 = new FFI.Library('gdi32', {
	CreateCompatibleDC: ['ulong', ['ulong']],
	CreateCompatibleBitmap: ['ulong', ['ulong', 'int', 'int']],
	SelectObject: ['ulong', ['ulong', 'ulong']],
	BitBlt: ['byte', ['ulong', 'int', 'int', 'int', 'int', 'ulong', 'int', 'int', 'uint']]
});

var hScreenDC = user32.GetDC(0);
var hMemoryDC = gdi32.CreateCompatibleDC(hScreenDC);

var x = user32.GetSystemMetrics(0);
var y = user32.GetSystemMetrics(1);

var hBitmap = gdi32.CreateCompatibleBitmap(hScreenDC, x, y);

var hOldBitmap = gdi32.SelectObject(hMemoryDC, hBitmap)

gdi32.BitBlt(hMemoryDC, 0, 0, x, y, hScreenDC, 0, 0, 0x00CC0020 | 0x40000000);
hBitmap = user32.SelectObject(hMemoryDC, hOldBitmap);

user32.DeleteDC(hMemoryDC);
user32.DeleteDC(hScreenDC);