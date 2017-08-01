using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Bullet : MonoBehaviour {
    float fired, duration = 5f;

	// Use this for initialization
	void Start () {
        fired = Time.time;
	}
	
	// Update is called once per frame
	void Update () {
        if (Time.time - fired > duration) {
            Destroy(this.gameObject);
        }
	}

    void OnTriggerEnter2D(Collider2D col) {
        Destroy(this.gameObject);
    }

}
