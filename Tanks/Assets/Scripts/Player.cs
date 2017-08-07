using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Player : MonoBehaviour {

    public bool up, down, left, right;
    Rigidbody2D rigid;
    public GameEngine.InputDirection dir;
    public float moveSpeed = 3.0f;
    public float shotSpeed = 6.0f;

    bool secondaryFiring;
    float secondaryFireTime, secondaryFireRate = 0.1f;

    public GameObject bulletGO;
    public GameObject secondaryGO;
    public AudioClip shotFired;
    public AudioClip explosion;
    AudioSource audioSource;

	// Use this for initialization
	void Start () {
        up = false;
        down = false;
        left = false;
        right = false;
        secondaryFiring = false;
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

        up = Input.GetKey(KeyCode.UpArrow) || Input.GetKey(KeyCode.W);
        down = Input.GetKey(KeyCode.DownArrow) || Input.GetKey(KeyCode.S);
        left = Input.GetKey(KeyCode.LeftArrow) || Input.GetKey(KeyCode.A);
        right = Input.GetKey(KeyCode.RightArrow) || Input.GetKey(KeyCode.D);

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
        // main gun
        if (Input.GetKeyDown(KeyCode.Space)) {
            GameObject bullet = Instantiate(bulletGO, transform.position + Vector3.right, Quaternion.identity);
            bullet.GetComponent<Rigidbody2D>().velocity = Vector2.right * shotSpeed;

            audioSource.PlayOneShot(shotFired);
        }

        if (Input.GetMouseButtonDown(0)) {
            secondaryFiring = true;
            secondaryFireTime = Time.time;

            FireSecondary();

            // start secondary audio
        }

        if (Input.GetMouseButtonUp(0)) {
            secondaryFiring = false;

            // end secondary audio
        }

        // secondary gun
        if (secondaryFiring) {
            if (Time.time - secondaryFireTime > secondaryFireRate) {
                secondaryFireTime = Time.time;
                FireSecondary();
            }
        }
    }

    public void FireSecondary() {
        Vector3 mousePos = Camera.main.ScreenToWorldPoint(Input.mousePosition);
        mousePos.z = 0f;

        Vector3 direction = (mousePos - transform.position).normalized;

        GameObject secondary = Instantiate(secondaryGO, transform.position + direction, Quaternion.identity);
        secondary.GetComponent<Rigidbody2D>().velocity = direction * shotSpeed;
    }


    public void Explosion() {
        audioSource.PlayOneShot(explosion);
    }
}
