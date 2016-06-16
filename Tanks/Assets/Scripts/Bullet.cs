using UnityEngine;
using System.Collections;

public class Bullet : MonoBehaviour {
  float spawnTime, lifeTime = 10f;

	// Use this for initialization
	void Start () {
    spawnTime = Time.time;
	}
	
	// Update is called once per frame
	void Update () {
	  if (Time.time - spawnTime >= lifeTime)
    {
      Destroy(this.gameObject);
    }
	}
}
