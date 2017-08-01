using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Player : MonoBehaviour {

    public bool up, down, left, right;
    Rigidbody2D rigid;
    public GameEngine.InputDirection dir;
    public float moveSpeed = 3.0f;
    public float shotSpeed = 6.0f;

    public GameObject bulletGO;
    public AudioClip shotFired;
    public AudioClip explosion;
    AudioSource audioSource;

	// Use this for initialization
	void Start () {
        up = false;
        down = false;
        left = false;
        right = false;
        dir = GameEngine.InputDirection.Idle;

        audioSource = GetComponent<AudioSource>();
        rigid = GetComponent<Rigidbody2D>();
	}
	
	// Update is called once per frame
    void Update () {
        rigid.velocity = GameEngine.move[GetInputDirection()] * moveSpeed;

        CheckFire();
	}

    GameEngine.InputDirection GetInputDirection() {

        up = Input.GetKey(KeyCode.UpArrow);
        down = Input.GetKey(KeyCode.DownArrow);
        left = Input.GetKey(KeyCode.LeftArrow);
        right = Input.GetKey(KeyCode.RightArrow);

        if (!up && !left && !down && !right) {
            return GameEngine.InputDirection.Idle;
        }

        if (up && !left && !down && !right) {
            return GameEngine.InputDirection.North;
        }

        if (up && !left && !down && right) {
            return GameEngine.InputDirection.Northeast;
        }

        if (!up && !left && !down && right) {
            return GameEngine.InputDirection.East;
        }

        if (!up && !left && down && right) {
            return GameEngine.InputDirection.Southeast;
        }

        if (!up && !left && down && !right) {
            return GameEngine.InputDirection.South;
        }

        if (!up && left && down && !right) {
            return GameEngine.InputDirection.Southwest;
        }

        if (!up && left && !down && !right) {
            return GameEngine.InputDirection.West;
        }

        if (up && left && !down && !right) {
            return GameEngine.InputDirection.Northwest;
        }

        return GameEngine.InputDirection.Idle;
    }

    void CheckFire() {
        if (Input.GetKeyDown(KeyCode.Space)) {
            GameObject bullet = Instantiate(bulletGO, transform.position + Vector3.right, Quaternion.identity);
            bullet.GetComponent<Rigidbody2D>().velocity = Vector2.right * shotSpeed;

            audioSource.PlayOneShot(shotFired);
        }
    }

    public void Explosion() {
        audioSource.PlayOneShot(explosion);
    }
}
