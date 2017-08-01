using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class GameEngine : MonoBehaviour {

    public enum InputDirection { Idle, North, Northeast, East, Southeast, South, Southwest, West, Northwest };

    public static Dictionary<InputDirection, Vector2> move = new Dictionary<InputDirection, Vector2>{
        {InputDirection.Idle, Vector2.zero},
        {InputDirection.North, Vector2.up},
        {InputDirection.Northeast, new Vector2(1, 1).normalized},
        {InputDirection.East, Vector2.right},
        {InputDirection.Southeast, new Vector2(1, -1).normalized},
        {InputDirection.South, Vector2.down},
        {InputDirection.Southwest, new Vector2(-1, -1).normalized},
        {InputDirection.West, Vector2.left},
        {InputDirection.Northwest, new Vector2(-1, 1).normalized}
    };

    public static float baseMovementSpeed = 2.0f;
}
