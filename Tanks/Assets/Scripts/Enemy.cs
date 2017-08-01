using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Enemy : MonoBehaviour {
    Rigidbody2D rigid;

    GameObject playerGO;

    public GameObject bulletGO;
    public Sprite splat;
    public float shotSpeed = 6.0f;
    public float moveSpeed = 1.5f;

    float shotTime;
    float fireRate = 1.5f;

    bool isAlive;
    bool appeared;

    int hitpoints = 3;


	// Use this for initialization
	void Start () {
        isAlive = true;
        appeared = false;
        rigid = GetComponent<Rigidbody2D>();
        rigid.velocity = Vector2.left * moveSpeed;
        playerGO = GameObject.FindWithTag("Player");
	}
	
	// Update is called once per frame
	void Update () {
        // not active until visible onscreen
        if (!appeared) {
            return;
        }

        // not active if dead
        if (isAlive) {
            // periodically fire at the player
            if (Time.time - shotTime > fireRate) {
                Fire();
            }
        }
	}

    void Fire() {
        if (playerGO == null) {
            return;
        }

        shotTime = Time.time;

        Vector3 playerPos = playerGO.transform.position;

        Vector3 spawnPos = transform.position + Vector3.left;
        Vector3 direction = (playerPos - spawnPos).normalized;

        GameObject bullet = Instantiate(bulletGO, spawnPos, Quaternion.identity);
        bullet.GetComponent<Rigidbody2D>().velocity = direction * shotSpeed;
    }

    void TakeDamage() {
        hitpoints--;

        playerGO.GetComponent<Player>().Explosion();

        if (hitpoints <= 0) {
            Kill();
        }
    }

    void OnCollisionEnter2D(Collision2D col) {
        // run over by the player = instant death
        Kill();
    }

    void OnTriggerEnter2D(Collider2D col) {
        // hit by player projectile
        TakeDamage();
    }

    void Kill() {
        isAlive = false;
        GetComponent<BoxCollider2D>().enabled = false;

        // maintain movement (player collision might send enemy flying)
        rigid.velocity = Vector2.left * GameEngine.baseMovementSpeed;

        // replace sprite with splat
        GetComponent<SpriteRenderer>().sprite = splat;
    }

    void OnBecameVisible() {
        appeared = true;
    }

    void OnBecameInvisible() {
        Destroy(this.gameObject);
    }
}
