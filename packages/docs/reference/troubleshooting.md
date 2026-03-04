# Troubleshooting

## Common Issues

### MCP tools not appearing in Claude Code

**Symptom**: After registration, tools like `record_token_usage` or `memory_store` don't appear.

**Solutions**:
1. **Wrong config file**: Edit `~/.claude.json`, NOT `~/.claude/.mcp.json`. The `.mcp.json` inside `~/.claude/` is a decoy — Claude Code reads the top-level file.
2. **Build not completed**: Run `pnpm build:ordered` — MCP servers need compiled `dist/index.js`.
3. **Wrong path**: Use forward slashes on Windows: `C:/path/to/dist/index.js`.
4. **Restart required**: Close and reopen VS Code completely after changing `~/.claude.json`.

### Build failure: better-sqlite3

**Symptom**: `node-gyp` compilation error during `pnpm install`.

**Solutions**:
1. Ensure Visual Studio Build Tools are installed (C++ Desktop workload)
2. Run `npm config set msvs_version 2022`
3. Fallback: `pnpm install --ignore-scripts` then manually build

### Build failure: hnswlib-node

**Symptom**: Native compilation fails on Windows.

**Solution**: The platform falls back to linear search if hnswlib-node fails. Performance degrades at scale but functionality is preserved.

### Vector memory first-run slow

**Symptom**: First `memory_store` or `memory_search` call takes 30-60 seconds.

**Cause**: The embedding model (~90MB) is downloading from HuggingFace Hub.

**Solution**: This is expected behavior. Subsequent calls are instant (model is cached). Progress is logged to stderr.

### Hooks not firing

**Symptom**: `cost-router.py` or `token-tracker-hook.py` produce no output.

**Solutions**:
1. Verify Python 3: `python3 --version`
2. Check hook files exist: `ls ~/.claude/hooks/`
3. Verify `~/.claude/settings.json` has correct hook config
4. Test manually: `echo '{"tool_name":"Agent","tool_input":{"subagent_type":"Explore"}}' | python3 ~/.claude/hooks/cost-router.py`

### SQLite "database is locked"

**Symptom**: Occasional `SQLITE_BUSY` errors during concurrent MCP operations.

**Solution**: All databases use WAL mode which handles most concurrency. If persistent:
1. Check no zombie Node.js processes: `tasklist | findstr node`
2. Delete WAL/SHM files: `rm .data/*/*.sqlite-wal .data/*/*.sqlite-shm`
3. Restart Claude Code

### Token tracker shows $0 costs

**Symptom**: `get_cost_report` returns zero costs despite active usage.

**Solutions**:
1. Verify the PostToolUse hook is configured in `~/.claude/settings.json`
2. Check the hook matcher includes the tools you're using
3. Verify the `TOKEN_DB` path in `token-tracker-hook.py` matches your installation

### ONNX Runtime stdout corruption

**Symptom**: MCP responses contain garbage text mixed with valid JSON.

**Cause**: ONNX Runtime logs to stdout by default, which conflicts with MCP stdio transport.

**Solution**: Already handled in the codebase — the vector-memory MCP sets `env.backends.onnx.logLevel = 'error'`. If still occurring, set `ONNX_LOG_LEVEL=error` in the MCP server env config.

## Performance Tips

### Speed up builds
```bash
# Build only what changed
pnpm --filter @eagles-ai-platform/token-tracker-mcp run build

# Skip type checking for faster builds
pnpm --filter "!@eagles-ai-platform/benchmark" run build
```

### Reduce memory usage
- Close unused MCP servers in `~/.claude.json` (comment out or remove)
- Each MCP server is a separate Node.js process (~50-100MB)

### Optimize vector search
- Keep vector count under 10K for sub-millisecond queries
- Use `project` and `tags` filters to narrow search scope
- Use `minScore: 0.5` to reduce noise in results
