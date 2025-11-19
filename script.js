/*

Usage:

import { LuaCEF } from 'https://cdn.jsdelivr.net/gh/chapo-scripts/arizona-cef-lua-intergration@main/script.js';

const cef = new LuaCEF(7712);

addEventListener('DOMContentLoaded', () => {
    cef.on('show-alert', (payload) => alert(payload.message || 'Alert text is empty!'));
    cef.call('HTMLEeventTriggered', { event: 'DOMContentLoaded' }); // Send load notification to lua script
    document.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', () => {
            cef.call('button-click', { payload: button.id });
        })
    });
});

*/

export class LuaCEF {
    port;
    client;
    handlers = {};
    constructor(port) {
        this.port = port;
        this.address = `ws://localhost:${port}`;
        this.client = new WebSocket(this.address);
        this.client.onopen = () => this.call('system', { message: 'ready' });
        this.client.onclose = () => {
            this.call('system', { message: 'close' });
            alert('LuaCEF: connection closed');
        }
        this.client.onerror = (e) => {
            this.call('system', { message: 'error' });
            alert('LuaCEF: error: ' + e);
        }
        this.client.onmessage = (e) => this.trigger(e.data);
    }
    on(event, callback) {
        if (!this.handlers[event])
            this.handlers[event] = [];
        this.handlers[event].push(callback);
    }
    call(event, payload) {
        this.client.send(JSON.stringify({ event: event, payload: payload }));
    }
    trigger(message) {
        const data = JSON.parse(message);
        if (!data || !data.event || !this.handlers[data.event])
            return;
        this.handlers[data.event].forEach(handler => handler(data.payload));
    }
}
