/**
 * scan-transition.js
 * Canvas-based scan-line page transition effect.
 * Draws diagonal dashed lines sweeping across the screen.
 */
(function () {
    'use strict';

    const canvas = document.getElementById('scan-canvas');

    function playScanTransition(callback) {
        if (!canvas) { callback(); return; }

        const ctx = canvas.getContext('2d');

        // Size canvas to viewport
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.display = 'block';
        canvas.style.opacity = '1';

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Pick color based on current theme
        const isLight = document.body.classList.contains('light-theme');
        ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        // Dashed strip pattern: ────  ────  (12px dash, 6px gap)
        ctx.setLineDash([12, 6]);

        const W = canvas.width;
        const H = canvas.height;

        // --- Diagonal lines: x + y = c (slope -1, /)
        // Sweeping from c=0 (top-left corner) to c=W+H (bottom-right corner)
        const perpSpacing = 12; // pixels between parallel diagonal lines
        const cStep = perpSpacing * Math.SQRT2;
        const cMin = 0;       // first line: top-left corner (0,0)
        const cMax = W + H;   // last line: bottom-right corner (W,H)
        const totalLines = Math.ceil((cMax - cMin) / cStep) + 1;

        const totalDuration = 900;  // ms to render all lines
        const msPerLine = totalDuration / totalLines;

        let currentLine = 0;
        let callbackFired = false;
        const callbackAtLine = Math.floor(totalLines * 0.50); // fire at 50% mark

        function getEndpoints(c) {
            // Clip line x + y = c to canvas boundaries [0..W] × [0..H]
            let x1, y1, x2, y2;
            // Start point: left edge (x=0) → y=c, or bottom edge (y=H) → x=c-H
            if (c <= H) { x1 = 0; y1 = c; }
            else { x1 = c - H; y1 = H; }
            // End point: top edge (y=0) → x=c, or right edge (x=W) → y=c-W
            if (c <= W) { x2 = c; y2 = 0; }
            else { x2 = W; y2 = c - W; }
            return [x1, y1, x2, y2];
        }

        function drawNextLine() {
            const c = cMin + currentLine * cStep;
            const [x1, y1, x2, y2] = getEndpoints(c);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            currentLine++;

            // Trigger content switch at midpoint (screen half-covered)
            if (!callbackFired && currentLine >= callbackAtLine) {
                callbackFired = true;
                callback();
            }

            if (currentLine < totalLines) {
                setTimeout(drawNextLine, msPerLine);
            } else {
                fadeOutCanvas();
            }
        }

        function fadeOutCanvas() {
            let opacity = 1;
            const fadeInterval = setInterval(() => {
                opacity -= 0.03;
                canvas.style.opacity = Math.max(0, opacity);
                if (opacity <= 0) {
                    clearInterval(fadeInterval);
                    canvas.style.display = 'none';
                    canvas.style.opacity = '1';
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }, 16); // ~60fps
        }

        drawNextLine();
    }

    // Expose globally for page-router to use
    window.playScanTransition = playScanTransition;

})();
