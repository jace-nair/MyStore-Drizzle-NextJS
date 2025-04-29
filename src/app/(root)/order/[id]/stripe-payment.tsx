import { FormEvent, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
  LinkAuthenticationElement,
} from "@stripe/react-stripe-js";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { SERVER_URL } from "@/lib/constants";

type Props = {
  priceInCents: number;
  orderId: string;
  clientSecret: string;
};

// Create Stripe Promise
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

const StripePayment = ({ priceInCents, orderId, clientSecret }: Props) => {
  // Get the theme the website is using. Use useTheme() hook form next-themes
  const { theme, systemTheme } = useTheme();

  // Create the StripeForm component
  const StripeForm = () => {
    // Initialize the Stripe variable and Element with useStripe and useElements.
    const stripe = useStripe();
    const elements = useElements();

    // Create state for the form using useState() hook. Set the default value as false for isLoading state.
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [email, setEmail] = useState("");

    // Handles form submit
    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();

      // Check conditions to NOT proceed
      if (stripe == null || elements == null || email == null) return;

      // If the conditions are fine then ...
      setIsLoading(true);

      stripe
        .confirmPayment({
          elements,
          confirmParams: {
            return_url: `${SERVER_URL}/order/${orderId}/stripe-payment-success`,
            //return_url: `${SERVER_URL}/order/${orderId}/success?payment_intent_id={PAYMENT_INTENT_ID}`,
          },
        })
        .then(({ error }) => {
          if (
            error?.type === "card_error" ||
            error?.type === "validation_error"
          ) {
            setErrorMessage(error?.message ?? "An unknown error occurred");
          } else if (error) {
            setErrorMessage("An unknown error occurred");
          }
        })
        .finally(() => setIsLoading(false));
    };

    // Return form component
    return (
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="text-xl">Stripe Checkout</div>
        {/* Check error message in our state and show if there's error */}
        {errorMessage && <div className="text-destructive">{errorMessage}</div>}
        {/* Payment Element component */}
        <PaymentElement />
        <div>
          {/* Link Authentication Element is an email field. Stripe link is a feature that lets users save their payment details so this email input can help recognize returning customers.*/}
          <LinkAuthenticationElement
            onChange={(e) => setEmail(e.value.email)}
          />
        </div>
        <Button
          className="w-full"
          size="lg"
          disabled={stripe == null || elements == null || isLoading}
        >
          {isLoading
            ? "Purchasing..."
            : `Purchase ${formatCurrency(priceInCents / 100)}`}
        </Button>
      </form>
    );
  };

  //TEST
  console.log("Stripe client secret:", clientSecret);

  if (!clientSecret) {
    return <div>Loading payment details...</div>;
  } else {
    // Use Elements to wrap the return
    return (
      <Elements
        options={{
          clientSecret,
          appearance: {
            theme:
              theme === "dark"
                ? "night"
                : theme === "light"
                ? "stripe"
                : systemTheme === "dark"
                ? "night"
                : "stripe",
          },
        }}
        stripe={stripePromise}
      >
        <StripeForm />
      </Elements>
    );
  }
};

export default StripePayment;
