ifdef vault_password_file
  VAULT = --vault-password-file $(vault_password_file)
else ifdef ANSIBLE_VAULT_PASSWORD_FILE_UNHANGOUT
  VAULT = --vault-password-file $(ANSIBLE_VAULT_PASSWORD_FILE_UNHANGOUT)
else
  VAULT = --ask-vault-pass
endif
ifdef room
  ROOM = --extra-vars @vars/room${room}.yml
else
  ROOM = --extra-vars @vars/room1.yml
endif

all:
	USAGE="Run 'make participants' or 'make listeners'"

participants:
	ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook browserrunner.yml $(VAULT) --user ubuntu $(ROOM) --extra-vars @vars/participants.yml

listeners:
	ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook browserrunner.yml $(VAULT) --user ubuntu $(ROOM) --extra-vars @vars/listeners.yml
