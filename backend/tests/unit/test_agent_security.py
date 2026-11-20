from app.agents.pin_security import hash_pin, pin_fingerprint, verify_pin


# Ensure PIN storage is one-way and verification accepts only the matching secret.
def test_pin_hash_verifies_without_storing_plaintext():
    # Hashing the same PIN twice yields independent salts and never returns the PIN.
    first_hash = hash_pin("0427")
    second_hash = hash_pin("0427")

    assert first_hash != second_hash
    assert "0427" not in first_hash
    assert verify_pin("0427", first_hash)
    assert not verify_pin("0428", first_hash)


# Confirm fingerprints are deterministic per owner but separated across users.
def test_pin_fingerprint_is_owner_scoped():
    # A keyed fingerprint enables uniqueness checks without retaining a reusable plaintext PIN.
    first_owner = pin_fingerprint("user-1", "0427", "a" * 40)
    same_owner = pin_fingerprint("user-1", "0427", "a" * 40)
    other_owner = pin_fingerprint("user-2", "0427", "a" * 40)

    assert first_owner == same_owner
    assert first_owner != other_owner


# Fail closed if a stored hash is malformed or contains altered work parameters.
def test_pin_verification_rejects_malformed_hashes():
    # Database corruption must not turn a malformed hash into a valid PIN match.
    assert not verify_pin("0427", "invalid")
    assert not verify_pin("0427", "scrypt$999999999$8$1$bad$bad")
