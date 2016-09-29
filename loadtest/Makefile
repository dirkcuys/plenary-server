ifdef vault_password_file
  VAULT = --vault-password-file $(vault_password_file)
else ifdef ANSIBLE_VAULT_PASSWORD_FILE_UNHANGOUT
  VAULT = --vault-password-file $(ANSIBLE_VAULT_PASSWORD_FILE_UNHANGOUT)
else
  VAULT = --ask-vault-pass
endif

all:
	USAGE="Run 'make participants' or 'make listeners'"

participants:
	ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook browserrunner.yml $(VAULT) --user ubuntu --extra-vars @vars/room1.yml --extra-vars @vars/participants.yml
participants1:
	ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook browserrunner.yml $(VAULT) --user ubuntu --extra-vars @vars/room2.yml --extra-vars @vars/participants.yml
participants2:
	ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook browserrunner.yml $(VAULT) --user ubuntu --extra-vars @vars/room3.yml --extra-vars @vars/participants.yml
participants3:
	ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook browserrunner.yml $(VAULT) --user ubuntu --extra-vars @vars/room4.yml --extra-vars @vars/participants.yml

listeners:
	ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook browserrunner.yml $(VAULT) --user ubuntu --extra-vars @vars/room1.yml --extra-vars @vars/listeners.yml
listeners1:
	ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook browserrunner.yml $(VAULT) --user ubuntu --extra-vars @vars/room2.yml --extra-vars @vars/listeners.yml
listeners2:
	ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook browserrunner.yml $(VAULT) --user ubuntu --extra-vars @vars/room3.yml --extra-vars @vars/listeners.yml
listeners3:
	ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook browserrunner.yml $(VAULT) --user ubuntu --extra-vars @vars/room4.yml --extra-vars @vars/listeners.yml
