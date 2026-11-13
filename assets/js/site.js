// Small site script: light/dark toggle and the gallery lightbox. No dependencies.
(function () {
	'use strict';

	// ----- Theme toggle (the saved choice is applied in <head> before first paint) -----
	var toggle = document.getElementById('theme-toggle');
	if (toggle) {
		toggle.addEventListener('click', function () {
			var root = document.documentElement;
			var current = root.getAttribute('data-theme') ||
				(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
			var next = current === 'dark' ? 'light' : 'dark';
			root.setAttribute('data-theme', next);
			try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
		});
	}

	// ----- Email links: the address is assembled here so it is not in the page source for harvesters -----
	Array.prototype.forEach.call(document.querySelectorAll('.js-email'), function (a) {
		var address = a.getAttribute('data-user') + '@' + a.getAttribute('data-domain');
		a.href = 'mailto:' + address;
		if (!a.hasAttribute('data-keep-label')) a.textContent = address;
	});

	// ----- Gallery lightbox: without JavaScript the links simply open the full image -----
	var shots = Array.prototype.slice.call(document.querySelectorAll('.gallery a.shot'));
	if (!shots.length) return;

	var box = document.createElement('div');
	box.className = 'lightbox';
	box.hidden = true;
	box.setAttribute('role', 'dialog');
	box.setAttribute('aria-modal', 'true');
	box.setAttribute('aria-label', 'Photo viewer');
	box.innerHTML =
		'<button class="lb-close" type="button" aria-label="Close">&times;</button>' +
		'<button class="lb-prev" type="button" aria-label="Previous photo">&#8249;</button>' +
		'<img alt="" />' +
		'<p></p>' +
		'<button class="lb-next" type="button" aria-label="Next photo">&#8250;</button>';
	document.body.appendChild(box);

	var img = box.querySelector('img');
	var caption = box.querySelector('p');
	var index = 0;
	var opener = null;

	function show(i) {
		index = (i + shots.length) % shots.length;
		var a = shots[index];
		var thumb = a.querySelector('img');
		var label = a.querySelector('span');
		img.src = a.href;
		img.alt = thumb ? thumb.alt : '';
		caption.textContent = label ? label.textContent : '';
	}
	function open(i) {
		opener = document.activeElement;
		show(i);
		box.hidden = false;
		document.body.style.overflow = 'hidden';
		box.querySelector('.lb-close').focus();
	}
	function close() {
		box.hidden = true;
		img.removeAttribute('src');
		document.body.style.overflow = '';
		if (opener && opener.focus) opener.focus();
	}

	shots.forEach(function (a, i) {
		a.addEventListener('click', function (e) {
			if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return; // let "open in new tab" work
			e.preventDefault();
			open(i);
		});
	});
	box.querySelector('.lb-close').addEventListener('click', close);
	box.querySelector('.lb-prev').addEventListener('click', function () { show(index - 1); });
	box.querySelector('.lb-next').addEventListener('click', function () { show(index + 1); });
	box.addEventListener('click', function (e) { if (e.target === box) close(); });
	document.addEventListener('keydown', function (e) {
		if (box.hidden) return;
		if (e.key === 'Escape') close();
		else if (e.key === 'ArrowLeft') show(index - 1);
		else if (e.key === 'ArrowRight') show(index + 1);
	});
})();
