async function calculatePhysics() {
        let velocity = floor(random() * 100);
        const gravity = 9.81;
        
        if (velocity > 50) {
            let drag = sin(velocity) / cos(gravity);
            return round(abs(drag));
        } else {
            return ceil(sqrt(pow(velocity, 2)));
        }
    }
    
const finalVal = await calculatePhysics();
