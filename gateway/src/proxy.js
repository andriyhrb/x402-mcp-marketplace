/**
 * Tool Proxy — x402 MCP Marketplace
 *
 * Proxies verified tool calls to the actual MCP server endpoint.
 * Handles timeouts and basic error wrapping.
 */

const _rawTimeout = parseInt(process.env.PROXY_TIMEOUT_MS || '15000', 10);
const PROXY_TIMEOUT_MS = Number.isFinite(_rawTimeout) && _rawTimeout > 0 ? _rawTimeout : 15000;

/**
 * Proxy a tool call to the MCP endpoint.
 *
 * @param {string} endpointUrl — MCP server URL
 * @param {string} method — MCP method name
 * @param {object} params — method parameters
 * @returns {object} — tool response
 */
async function proxyToolCall(endpointUrl, method, params) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: method || 'tools/call',
        params: params || {},
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        error: true,
        statusCode: response.status,
        message: `Tool endpoint returned ${response.status}: ${errorText.slice(0, 200)}`,
      };
    }

    const result = await response.json();
    return result;

  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      return {
        error: true,
        message: `Tool call timed out after ${PROXY_TIMEOUT_MS}ms`,
      };
    }

    return {
      error: true,
      message: `Tool call failed: ${err.message}`,
    };
  }
}

module.exports = { proxyToolCall };
