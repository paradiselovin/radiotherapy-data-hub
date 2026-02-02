def validate_experiment_machine(machine, energy):
    if energy not in machine.allowed_energies:
        raise ValueError(
            f"Énergie {energy} incompatible avec la machine {machine.model}"
        )

