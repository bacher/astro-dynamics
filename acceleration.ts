const G = 9.81;
const SPEED_OF_LIGHT = 299_792_458;
const SPEED_LIMIT = SPEED_OF_LIGHT * 0.9999;
const DAY = 24 * 60 * 60;
const YEAR = 365.25 * DAY;
const LIGHT_YEAR = SPEED_OF_LIGHT * YEAR;
const DEFAULT_SIM_LOCAL_STEP_INTERVAL = 60;

type AccelerationOptions = {
  sim_local_step_interval?: number;
  acceleration?: number;
};

type AccelerationState = {
  iteration: number;
  world_speed: number;
  world_distance: number;
  local_time_passed: number;
  world_time_passed: number;
  current_slowliness: number;
};

let next_log_at_world_speed = 0.1;

function accelerate({
  sim_local_step_interval = DEFAULT_SIM_LOCAL_STEP_INTERVAL,
  acceleration = G,
}: AccelerationOptions): void {
  let iteration = 0;
  let world_distance = 0;
  let world_speed = 0;
  let local_time_passed = 0;
  let world_time_passed = 0;

  let log_count = 0;

  function log() {
    if (log_count > 0) {
      console.log("---");
    }
    log_count += 1;

    prettyPrintAccelerationResult({
      iteration,
      world_speed,
      world_time_passed,
      local_time_passed,
      current_slowliness: Math.sqrt(1 - (world_speed / SPEED_OF_LIGHT) ** 2),
      world_distance,
    });
  }

  while (true) {
    iteration += 1;

    const speed_ratio = world_speed / SPEED_OF_LIGHT;
    const slowliness_ratio = Math.sqrt(1 - speed_ratio ** 2);

    local_time_passed += sim_local_step_interval;
    const world_time_increment = sim_local_step_interval / slowliness_ratio;
    world_time_passed += world_time_increment;

    const world_speed_increment = acceleration * sim_local_step_interval;

    world_distance +=
      (world_speed + world_speed_increment / 2) * world_time_increment;

    world_speed += world_speed_increment;

    if (speed_ratio >= next_log_at_world_speed) {
      log();
      if (speed_ratio >= 0.9) {
        next_log_at_world_speed += 0.05;
      } else if (speed_ratio >= 0.5) {
        next_log_at_world_speed += 0.1;
      } else {
        next_log_at_world_speed += 0.2;
      }
    }

    if (world_speed >= SPEED_LIMIT) {
      log();
      break;
    }
  }
}

function prettyPrintAccelerationResult(state: AccelerationState) {
  console.log(`Iteration:           ${state.iteration}`);
  console.log(`Speed:               ${state.world_speed.toFixed(0)} m/s`);
  console.log(
    `  of speed of light: ${(state.world_speed / SPEED_OF_LIGHT).toFixed(10)}`
  );
  console.log(`Distance:            ${state.world_distance.toFixed(0)} m`);
  console.log(
    `  of light year:     ${(state.world_distance / LIGHT_YEAR).toFixed(3)}`
  );
  console.log(
    `Local time passed:   ${(state.local_time_passed / DAY).toFixed(0)} d`
  );
  console.log(
    `World time passed:   ${(state.world_time_passed / DAY).toFixed(0)} d`
  );
  console.log(
    `Slowliness:          ${state.current_slowliness.toFixed(6)} (${(
      100 * state.current_slowliness
    ).toFixed(4)}%) (slower in ${(1 / state.current_slowliness).toFixed(
      2
    )} times)`
  );
}

accelerate({});
