import base64
import hashlib
import hmac
import os


# Use a deliberately expensive password hash because four-digit PINs have a small search space.
SCRYPT_N = 2**14
SCRYPT_R = 8
SCRYPT_P = 1
SCRYPT_KEY_LENGTH = 64


def pin_fingerprint(owner_id: str, pin: str, pepper: str) -> str:
    # Key the deterministic uniqueness fingerprint so a database-only leak cannot enumerate PINs.
    message = f"{owner_id}\0{pin}".encode("utf-8")
    return hmac.new(pepper.encode("utf-8"), message, hashlib.sha256).hexdigest()


def hash_pin(pin: str) -> str:
    # Store only a salted scrypt derivation; the original PIN never enters persistence.
    salt = os.urandom(16)
    derived = hashlib.scrypt(
        pin.encode("ascii"),
        salt=salt,
        n=SCRYPT_N,
        r=SCRYPT_R,
        p=SCRYPT_P,
        dklen=SCRYPT_KEY_LENGTH,
    )
    encoded_salt = base64.urlsafe_b64encode(salt).decode("ascii")
    encoded_derived = base64.urlsafe_b64encode(derived).decode("ascii")
    return f"scrypt${SCRYPT_N}${SCRYPT_R}${SCRYPT_P}${encoded_salt}${encoded_derived}"


def verify_pin(pin: str, encoded_hash: str) -> bool:
    # Reject malformed or unexpected hash parameters before doing expensive derivation work.
    try:
        algorithm, n_value, r_value, p_value, encoded_salt, encoded_derived = encoded_hash.split("$")
        if (
            algorithm != "scrypt"
            or int(n_value) != SCRYPT_N
            or int(r_value) != SCRYPT_R
            or int(p_value) != SCRYPT_P
        ):
            return False
        salt = base64.urlsafe_b64decode(encoded_salt.encode("ascii"))
        expected = base64.urlsafe_b64decode(encoded_derived.encode("ascii"))
        actual = hashlib.scrypt(
            pin.encode("ascii"),
            salt=salt,
            n=SCRYPT_N,
            r=SCRYPT_R,
            p=SCRYPT_P,
            dklen=SCRYPT_KEY_LENGTH,
        )
    except (ValueError, TypeError, UnicodeEncodeError):
        return False

    # Compare derived bytes in constant time to avoid leaking verification information.
    return hmac.compare_digest(actual, expected)
