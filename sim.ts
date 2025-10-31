const G = 6.6743e-11;
const HOUR = 60 * 60;

const iter_limit = 10_000_000;

const results: { mass: number, distance: number, time_passed: number }[] = [];

const MASSES = [2_500, 5_000, 10_000, 20_000, 40_000];
const DISTANCES = [5, 7, 10, 13, 17, 20, 25, 30, 35, 40, 50, 70, 80, 100, 110, 120, 130, 140, 150, 200, 300, 500, 700, 1000];

function check({mass, distance, save_results = false}: {mass: number, distance: number, save_results?: boolean}) {
  const time_passed = simulate(mass, distance);
  const approx_time = getTimeToCollapseByMassAndRadius({mass, distance });

  if (save_results) {
    results.push({mass, distance, time_passed});
  }

  const d_f = distance.toString().padStart(5);
  const m_f = formatMass(mass);
  const sim_time_f = (time_passed/HOUR).toFixed(3).padStart(9);
  const approx_time_f = (approx_time/HOUR).toFixed(3).padStart(9);
  const error_f = (((approx_time-time_passed)/time_passed)*100).toFixed(1).padStart(5);

  console.log(`M: ${m_f}, D: ${d_f}m, sim_time: ${sim_time_f}h, approx_time: ${approx_time_f}h, error: ${error_f}%`);
}

function formatMass(mass: number): string {
  if (mass < 1_000) {
    return `${mass}kg`.padStart(10);
  }
  if (mass < 1_000_000) {
    return `${Math.round(mass / 1_000)}ton`.padStart(10);
  }
  if (mass < 1_000_000_000) {
    return `${Math.round(mass / 1_000_000)} mln kg`.padStart(10);
  }
  return `${Math.round(mass / 1_000_000_000)} bln kg`.padStart(10);
}

function simulate(mass: number, distance: number): number {
  let r = distance;

  let time_modifier = 1;
  let time_passed = 0;
  let speed = 0;

  const minimal_step_distance = distance / 10_000;

  for (let i = 0; i < iter_limit; i += 1) {
    const a1 = G * mass / (r ** 2);
    const time = time_modifier;
    time_passed += time;
    const step_distance = (speed + a1 * time / 2) * time;
    speed += a1 * time;

    // if (step_distance < 0.01) {
    if (step_distance < minimal_step_distance) {
      time_modifier *= 1.1;
    // if (step_distance > 0.02) {
    } else {
      time_modifier /= 1.1;
    }

    // times 2 because both objects are moving at the same speed
    r -= step_distance * 2;

    // console.log(time_modifier);

    if (r <= 0) {
      // let time_humanized;
      // if (time_passed > 60 * 60 * 24) {
      //   time_humanized = `${(time_passed / 60 / 60 / 24).toFixed(1)} days`;
      // } else if (time_passed > 60 * 60) {
      //   time_humanized = `${Math.floor(time_passed / 60 / 60)} hours`;
      // } else if (time_passed > 60) {
      //   time_humanized = `${Math.floor(time_passed / 60)} minutes`;
      // } else {
      //   time_humanized = `${Math.floor(time_passed)} seconds`;
      // }
      // console.log(`It took ${time_humanized} to collide from ${distance} meters`);
      return time_passed;
    }
  }

  console.log(`After ${Math.floor(time_passed)} seconds, the distance reduced by ${Math.floor(distance - r)}m`);
  
  return NaN;
}

// Approximately equals to:
//   y = 0.27x^(2-0.502)
// https://www.desmos.com/calculator/wtncytpswm

//  2_500 -> 0.54
//  5_000 -> 0.38
// 10_000 -> 0.27
// 20_000 -> 0.19
// 40_000 -> 0.135

// for dots (0.54,0.25),(0.38,0.5),(0.27,1),(0.19,2),(0.135,4)
// the equation approximately equals to:
// (1) y = -0.1  + 0.2  / (x-0.13)^0.8
// (2) y = -0.14 + 0.16 / (x-0.07)^1.2  <-- better
// but it's reversed equation, we want to be able to calculate x from y,
// so we need to solve it for x.

// (y + 0.1) / 0.2 = 1 / (x-0.13)^0.8
// 0.2 / (y + 0.1) = (x-0.13)^0.8
// (0.2 / (y + 0.1))^(1/0.8) = x-0.13
// x = (0.2 / (y + 0.1))^(1/0.8) + 0.13

// then we should divide y by 10_000, because the equation was calculated for y = mass/10_000
// x = (0.2 / (y/10_000 + 0.1))^(1/0.8) + 0.13

function getMultiplierFromMass_1(mass:number): number {
  return (0.2 / (mass/10_000 + 0.1))**(1/0.8) + 0.13;
}
function getMultiplierFromMass_2(mass:number): number {
  return (0.16 / (mass/10_000 + 0.14))**(1/1.2) + 0.07;
}

function getTimeToCollapseByMassAndRadius({mass, distance}: {mass: number, distance: number}): number {
  return (getMultiplierFromMass_2(mass) * (distance ** (2-0.502))) * HOUR
}

// console.log(getMultiplierFromMass_2(10_000).toFixed(3));

// for (const mass of MASSES) {
//   for (const distance of DISTANCES) {
//     check({mass, distance});
//   }
//   console.log('---');
// }

// check({mass: 100_000, distance: 10000, save_results: true});
// check({mass: 10_000_000, distance: 100000, save_results: true});
// check({mass: 700_000_000, distance: 1_000_000, save_results: true});
// check({mass: 1_000_000_000, distance: 1_000_000, save_results: true});
// check({mass: 2_000_000_000, distance: 1_000_000, save_results: true});

for (const mass of MASSES) {
  check({mass, distance: 1_000, save_results: true});
}

// for (const distance of DISTANCES) {
//   check({mass: 10_000, distance, save_results: true});
// }

if (results.length > 0) {
  console.log(results.map(({mass, distance, time_passed}) => {
    const x = mass;
    // const y = time_passed / HOUR;
    const y = time_passed;
    return `(${x}, ${y.toFixed(3)})`;
  }).join(', '));
}