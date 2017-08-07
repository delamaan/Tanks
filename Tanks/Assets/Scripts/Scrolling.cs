using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Scrolling : MonoBehaviour {
    Rigidbody2D rigid;
    Vector3 startPos;

	// Use this for initialization
    void Start () {
        startPos = transform.position;
        rigid = GetComponent<Rigidbody2D>();
        rigid.velocity = Vector3.left * GameEngine.baseMovementSpeed;
	}
	
	// Update is called once per frame
	void Update () {
		
	}

    void OnTriggerEnter2D(Collider2D col) {
        transform.position = startPos;
    }
}
