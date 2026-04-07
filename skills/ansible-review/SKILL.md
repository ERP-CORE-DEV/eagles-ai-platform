---
name: ansible-review
description: Review Ansible playbooks and roles for best practices, idempotency, and security
argument-hint: "<playbook-or-role-path>"
tags: [iac, ansible, review, security]
user-invocable: true
---

# Ansible Review

Review Ansible playbooks and roles for best practices.

## Checks

1. **ansible-lint compliance**: run ansible-lint with default rules, zero violations
2. **No shell/command when module exists**: flag shell: apt-get install (use apt module), shell: systemctl restart (use systemd module)
3. **Idempotency**: every task safe to re-run; flag tasks that modify state without creates/removes guards
4. **Vault for secrets**: all passwords, keys, tokens must be vault-encrypted; flag plaintext secrets in vars
5. **Handlers for restarts**: service restarts via notify + handler, not inline in tasks
6. **Fully qualified collection names**: use ansible.builtin.copy not just copy
7. **Become usage**: use become: true only on tasks that need it, not globally
8. **Tags for selective runs**: all roles and task blocks should have tags
9. **Variable naming**: snake_case, prefixed with role name to avoid collisions
10. **Template validation**: Jinja2 templates use {{ variable | default('fallback') }} for optional vars

## Output
Severity-sorted findings: CRITICAL, HIGH, MEDIUM, LOW, PASSED.

## Arguments
- `<playbook-or-role-path>`: Path to playbook or role directory
