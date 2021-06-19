import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";

import { NotFoundError, submitRegistration, queryRegistration } from "./handler";
import { useRetry } from "/lib/retry";

export default {
  setup() {
    const emailAddressInput = ref("");
    let registrationID = uuidv4();

    let location;
    let isEmailRejected;

    const { retry } = useRetry();
    const retryIntervals = [100, 200, 300, 500, 1000, 1000, 2000, 5000];

    const handleSubmit = async (e) => {
      e.preventDefault();

      console.log("Registration ID:", registrationID);
      console.log("Email Address:", emailAddressInput.value);

      try {
        ({ location } = await submitRegistration(registrationID, emailAddressInput.value));

        const operation = async () => await queryRegistration(location);

        ({ isEmailRejected } = await retry([NotFoundError], retryIntervals, operation));
      } catch(err) {
        console.log("Error!");

        return;
      }

      if (isEmailRejected) {
        console.log("Email address is already in use.")

        return;
      }

      console.log("Registration successful!");
    };

    return () => {
      return (
        <>
          <div>
            User Registration
          </div>
          <form onSubmit={handleSubmit}>
            <div>Email Address</div>
            <div>
              <input type="text" v-model={emailAddressInput.value} name="email" id="email" placeholder="Email Address" />
            </div>
            <div>
              <button type="submit">
                Register!
              </button>
            </div>
          </form>
        </>
      );
    };
  }
};
