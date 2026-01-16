// Element Inspector Content Script
(function () {
    // Prevent multiple injections
    if (window.__elementInspectorActive) {
        return;
    }
    window.__elementInspectorActive = true;

    let hoveredElement = null;
    let overlay = null;
    let tooltip = null;

    // Create overlay element for highlighting
    function createOverlay() {
        overlay = document.createElement('div');
        overlay.id = '__element-inspector-overlay';
        document.body.appendChild(overlay);

        tooltip = document.createElement('div');
        tooltip.id = '__element-inspector-tooltip';
        document.body.appendChild(tooltip);
    }

    // Generate unique CSS selector / JS path for an element
    function getJsPath(element) {
        if (!element || element === document.body) {
            return 'document.body';
        }

        // If element has a unique ID, use it
        if (element.id) {
            return `document.querySelector('#${CSS.escape(element.id)}')`;
        }

        const path = [];
        let current = element;

        while (current && current !== document.body && current !== document) {
            let selector = current.tagName.toLowerCase();

            if (current.id) {
                selector = `#${CSS.escape(current.id)}`;
                path.unshift(selector);
                break;
            } else if (current.className && typeof current.className === 'string') {
                const classes = current.className.trim().split(/\s+/).filter(c => c && !c.startsWith('__element-inspector'));
                if (classes.length > 0) {
                    selector += '.' + classes.map(c => CSS.escape(c)).join('.');
                }
            }

            // Add nth-child if needed for uniqueness
            const parent = current.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children).filter(el => {
                    if (el.tagName !== current.tagName) return false;
                    if (current.className && el.className !== current.className) return false;
                    return true;
                });
                if (siblings.length > 1) {
                    const index = siblings.indexOf(current) + 1;
                    selector += `:nth-child(${Array.from(parent.children).indexOf(current) + 1})`;
                }
            }

            path.unshift(selector);
            current = parent;
        }

        const fullSelector = path.join(' > ');
        return `document.querySelector('${fullSelector}')`;
    }

    // Get simplified CSS selector (without document.querySelector wrapper)
    function getCssSelector(element) {
        const jsPath = getJsPath(element);
        const match = jsPath.match(/document\.querySelector\(['"](.+)['"]\)/);
        return match ? match[1] : element.tagName.toLowerCase();
    }

    // Get attributes formatted
    function getAttributesFormatted(element) {
        const attrs = [];
        for (const attr of element.attributes) {
            if (!attr.name.startsWith('__element-inspector')) {
                attrs.push(`${attr.name}:\n${attr.value}`);
            }
        }
        return attrs.join('\n');
    }

    // Get computed styles formatted (key styles only)
    function getComputedStylesFormatted(element) {
        const computed = window.getComputedStyle(element);
        const styles = [];

        // Key computed style properties
        const props = ['color', 'backgroundColor', 'fontSize', 'fontFamily', 'display', 'position'];

        for (const prop of props) {
            const value = computed[prop];
            if (value && value !== 'rgba(0, 0, 0, 0)') {
                styles.push(`${prop}:\n${value}`);
            }
        }

        return styles.join('\n');
    }

    // Get position and size
    function getPositionAndSize(element) {
        const rect = element.getBoundingClientRect();
        return `top:\n${Math.round(rect.top)}px
left:\n${Math.round(rect.left)}px
width:\n${rect.width}px
height:\n${rect.height}px`;
    }

    // Format the clipboard content
    function formatClipboardContent(element) {
        const cssSelector = getCssSelector(element);
        const outerHTML = element.outerHTML;
        const attributes = getAttributesFormatted(element);
        const computedStyles = getComputedStylesFormatted(element);
        const positionSize = getPositionAndSize(element);
        const innerText = element.innerText ? element.innerText.trim() : '';

        return `ELEMENT
${outerHTML}
PATH
${cssSelector}
ATTRIBUTES
${attributes}
COMPUTED STYLES
${computedStyles}
POSITION & SIZE
${positionSize}
INNER TEXT
${innerText}`;
    }

    // Copy to clipboard
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return true;
            } catch (e) {
                document.body.removeChild(textarea);
                return false;
            }
        }
    }

    // Show success notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.id = '__element-inspector-notification';
        notification.className = type;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Update overlay position
    function updateOverlay(element) {
        if (!element || !overlay) return;

        const rect = element.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        overlay.style.top = (rect.top + scrollY) + 'px';
        overlay.style.left = (rect.left + scrollX) + 'px';
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';
        overlay.style.display = 'block';

        // Update tooltip
        const tagName = element.tagName.toLowerCase();
        const id = element.id ? `#${element.id}` : '';
        const classes = element.className && typeof element.className === 'string'
            ? '.' + element.className.trim().split(/\s+/).filter(c => !c.startsWith('__element-inspector')).join('.')
            : '';

        tooltip.textContent = `${tagName}${id}${classes}`;
        tooltip.style.top = (rect.top + scrollY - 30) + 'px';
        tooltip.style.left = (rect.left + scrollX) + 'px';
        tooltip.style.display = 'block';

        // Adjust tooltip if it goes off screen
        if (rect.top < 30) {
            tooltip.style.top = (rect.bottom + scrollY + 5) + 'px';
        }
    }

    // Hide overlay
    function hideOverlay() {
        if (overlay) overlay.style.display = 'none';
        if (tooltip) tooltip.style.display = 'none';
    }

    // Mouse move handler
    function handleMouseMove(e) {
        const target = e.target;

        // Ignore our own elements
        if (target.id && target.id.startsWith('__element-inspector')) {
            return;
        }

        if (target !== hoveredElement) {
            hoveredElement = target;
            updateOverlay(target);
        }
    }

    // Click handler
    async function handleClick(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const target = e.target;

        // Ignore our own elements
        if (target.id && target.id.startsWith('__element-inspector')) {
            return;
        }

        // Format and copy
        const content = formatClipboardContent(target);
        const success = await copyToClipboard(content);

        if (success) {
            showNotification('✓ Copied to clipboard!', 'success');
        } else {
            showNotification('✗ Failed to copy', 'error');
        }

        // Cleanup and exit inspect mode
        cleanup();
    }

    // Keyboard handler (ESC to cancel)
    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            showNotification('Inspection cancelled', 'info');
            cleanup();
        }
    }

    // Cleanup function
    function cleanup() {
        document.removeEventListener('mousemove', handleMouseMove, true);
        document.removeEventListener('click', handleClick, true);
        document.removeEventListener('keydown', handleKeyDown, true);

        if (overlay) overlay.remove();
        if (tooltip) tooltip.remove();

        window.__elementInspectorActive = false;
    }

    // Initialize
    function init() {
        createOverlay();

        document.addEventListener('mousemove', handleMouseMove, true);
        document.addEventListener('click', handleClick, true);
        document.addEventListener('keydown', handleKeyDown, true);

        showNotification('🔍 Click any element to copy', 'info');
    }

    init();
})();
