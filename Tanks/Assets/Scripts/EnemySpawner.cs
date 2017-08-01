using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class EnemySpawner : MonoBehaviour {
    float spawnTime, baseSpawnRate = 1.5f, spawnRate;
    public GameObject enemyGO;

	// Use this for initialization
	void Start () {
        spawnRate = baseSpawnRate;
	}
	
	// Update is called once per frame
	void Update () {
        if (Time.time - spawnTime > spawnRate) {
            SpawnEnemy();
        }
	}

    void SpawnEnemy() {
        spawnTime = Time.time;
        spawnRate = baseSpawnRate + Random.Range(0f, 2f);

        // random Y position

        Vector3 yOffset = new Vector3(0, Random.Range(-3f, 3f));

        Instantiate(enemyGO, transform.position + yOffset, Quaternion.identity);
    }
}
