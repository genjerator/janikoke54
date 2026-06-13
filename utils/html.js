import React from 'react';
import { Text, Linking } from 'react-native';

// Lightweight, dependency-free HTML -> React Native <Text> renderer.
// Supports a small set of common tags used in prize descriptions:
//   b, strong, i, em, u, br, p, div, ul/ol, li, a
// Anything it doesn't understand is treated as plain text (tags dropped).

const NAMED_ENTITIES = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    hellip: '…',
    mdash: '—',
    ndash: '–',
    rsquo: '’',
    lsquo: '‘',
    rdquo: '”',
    ldquo: '“',
    copy: '©',
    reg: '®',
    trade: '™',
    euro: '€',
    deg: '°',
};

export function decodeEntities(str = '') {
    return str.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, body) => {
        if (body[0] === '#') {
            const isHex = body[1] === 'x' || body[1] === 'X';
            const code = parseInt(isHex ? body.slice(2) : body.slice(1), isHex ? 16 : 10);
            return Number.isFinite(code) ? String.fromCodePoint(code) : match;
        }
        const named = NAMED_ENTITIES[body.toLowerCase()];
        return named !== undefined ? named : match;
    });
}

// Strip all tags and collapse whitespace -> plain readable text.
export function stripHtml(html = '') {
    const noBlocks = html
        .replace(/<\s*(br|p|div|li|tr|h[1-6])\s*\/?>/gi, '\n')
        .replace(/<\/\s*(p|div|li|tr|h[1-6])\s*>/gi, '\n');
    return decodeEntities(noBlocks.replace(/<[^>]+>/g, ''))
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]*\n[ \t]*/g, '\n')
        .trim();
}

const VOID_TAGS = new Set(['br', 'hr', 'img']);
const INLINE_STYLES = {
    b: { fontWeight: '700' },
    strong: { fontWeight: '700' },
    i: { fontStyle: 'italic' },
    em: { fontStyle: 'italic' },
    u: { textDecorationLine: 'underline' },
    a: { textDecorationLine: 'underline', color: '#4A90E2' },
};
const BLOCK_TAGS = new Set(['p', 'div', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

function tokenize(html) {
    const tokens = [];
    const regex = /<(\/?)([a-zA-Z0-9]+)([^>]*?)\/?>/g;
    let last = 0;
    let match;
    while ((match = regex.exec(html)) !== null) {
        if (match.index > last) {
            tokens.push({ type: 'text', value: html.slice(last, match.index) });
        }
        tokens.push({
            type: match[1] ? 'close' : 'open',
            tag: match[2].toLowerCase(),
            attrs: match[3] || '',
        });
        last = regex.lastIndex;
    }
    if (last < html.length) {
        tokens.push({ type: 'text', value: html.slice(last) });
    }
    return tokens;
}

function getAttr(attrs, name) {
    const m = attrs.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
    return m ? (m[2] ?? m[3] ?? '') : null;
}

// Renders an HTML string as nested <Text> nodes preserving common inline/block formatting.
export function RenderHtml({ html, style, linkStyle }) {
    if (!html) return null;

    const tokens = tokenize(html);
    const nodes = [];
    const stack = []; // active inline tags with their attrs
    let key = 0;
    let listDepth = 0;
    let pendingNewlineBlocks = 0; // collapse consecutive block boundaries
    let producedContent = false;

    const flushBlockBreak = () => {
        if (producedContent && pendingNewlineBlocks > 0) {
            nodes.push(<Text key={`br${key++}`}>{'\n'}</Text>);
        }
        pendingNewlineBlocks = 0;
    };

    const pushText = (raw) => {
        const text = decodeEntities(raw).replace(/\s+/g, ' ');
        if (!text || text === ' ') return;
        flushBlockBreak();

        const activeStyles = stack.map((s) => INLINE_STYLES[s.tag]).filter(Boolean);
        const linkFrame = [...stack].reverse().find((s) => s.tag === 'a');
        const href = linkFrame ? getAttr(linkFrame.attrs, 'href') : null;

        const composed = [style, ...activeStyles];
        if (href) composed.push(linkStyle || INLINE_STYLES.a);

        nodes.push(
            <Text
                key={`t${key++}`}
                style={composed}
                onPress={href ? () => Linking.openURL(href).catch(() => {}) : undefined}
            >
                {text}
            </Text>
        );
        producedContent = true;
    };

    for (const tok of tokens) {
        if (tok.type === 'text') {
            pushText(tok.value);
        } else if (tok.type === 'open') {
            if (VOID_TAGS.has(tok.tag)) {
                if (tok.tag === 'br') {
                    if (producedContent) nodes.push(<Text key={`br${key++}`}>{'\n'}</Text>);
                }
                continue;
            }
            if (tok.tag === 'li') {
                flushBlockBreak();
                if (producedContent) nodes.push(<Text key={`br${key++}`}>{'\n'}</Text>);
                nodes.push(<Text key={`bullet${key++}`} style={style}>{'• '}</Text>);
                producedContent = true;
            } else if (BLOCK_TAGS.has(tok.tag)) {
                if (tok.tag === 'ul' || tok.tag === 'ol') listDepth++;
                pendingNewlineBlocks++;
            }
            stack.push(tok);
        } else if (tok.type === 'close') {
            // pop until matching tag (tolerate unclosed/misnested tags)
            for (let i = stack.length - 1; i >= 0; i--) {
                if (stack[i].tag === tok.tag) {
                    stack.splice(i);
                    break;
                }
            }
            if (tok.tag === 'ul' || tok.tag === 'ol') listDepth = Math.max(0, listDepth - 1);
            if (BLOCK_TAGS.has(tok.tag) && tok.tag !== 'li') pendingNewlineBlocks++;
        }
    }

    if (nodes.length === 0) return null;
    return <Text style={style}>{nodes}</Text>;
}

export default RenderHtml;
