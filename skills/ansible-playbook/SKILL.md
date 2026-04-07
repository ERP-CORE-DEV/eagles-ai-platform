---
name: ansible-playbook
description: Generate Ansible playbooks with roles, inventories, vault secrets, and molecule tests
argument-hint: "<playbook-name> [--role=<role-name>]"
tags: [iac, ansible, configuration, automation]
user-invocable: true
---

# Ansible Playbook Generation

Generate Ansible playbooks following best practices.

## What To Do

### 1. Playbook Structure
- hosts, become, vars, roles, tasks, handlers
- Import roles with include_role or roles: list
- Tags for selective execution (--tags deploy, --tags configure)
- Error handling: block/rescue/always for critical sections

### 2. Role Structure
```
roles/{role_name}/
  tasks/main.yml
  handlers/main.yml
  defaults/main.yml      # Default variables (overridable)
  vars/main.yml           # Role-internal variables
  templates/              # Jinja2 templates
  files/                  # Static files
  meta/main.yml           # Dependencies, platforms
  molecule/default/       # Molecule test scenario
```

### 3. Inventory
- YAML format inventory with groups and host_vars
- Dynamic inventory scripts for cloud providers (aws_ec2, azure_rm, gcp_compute)
- group_vars/ and host_vars/ directories for variable hierarchy

### 4. Vault Secrets
- ansible-vault encrypt for all sensitive data (passwords, keys, tokens)
- Vault ID labels for multiple vault passwords
- Never commit unencrypted secrets — use .gitignore for vault password files

### 5. Idempotency
- Every task must be safe to run multiple times with identical result
- Use state: present/absent explicitly (never rely on defaults)
- Handlers for service restarts (notify + handler, not inline restart)

### 6. Molecule Testing
- molecule init scenario for each role
- Converge, verify, and destroy lifecycle
- Testinfra or Ansible assertions for verification
- Docker or Vagrant for test instances

## Arguments
- `<playbook-name>`: Playbook name (e.g., deploy-app, configure-db)
- `--role=<role-name>`: Generate a role instead of a playbook
