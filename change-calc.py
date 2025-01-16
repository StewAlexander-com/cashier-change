def calculate_total_change(payment_amount, cost):
    change_needed = payment_amount - cost
    
    denominations = {
        100: ("hundred dollar bill", "hundred dollar bills"),
        50: ("fifty dollar bill", "fifty dollar bills"),
        20: ("twenty dollar bill", "twenty dollar bills"),
        10: ("ten dollar bill", "ten dollar bills"),
        5: ("five dollar bill", "five dollar bills"),
        1: ("one dollar bill", "one dollar bills"),
        0.25: ("quarter", "quarters"),
        0.10: ("dime", "dimes"),
        0.05: ("nickel", "nickels"),
        0.01: ("penny", "pennies")
    }
    
    print(f"\nPayment: ${payment_amount:.2f}")
    print(f"Cost: ${cost:.2f}")
    print(f"Change due: ${change_needed:.2f}")
    print("\nOptimal change:")
    
    for denom in sorted(denominations.keys(), reverse=True):
        if change_needed >= denom:
            if denom == 0.01:
                # Convert remaining amount to pennies and round to avoid floating point errors
                num = round(change_needed * 100)
            else:
                num = int(change_needed // denom)
                change_needed = round(change_needed % denom, 2)
            
            if num > 0:
                denomination_name = denominations[denom][0] if num == 1 else denominations[denom][1]
                print(f"{num} {denomination_name}")


def confirm_quit():
    while True:
        confirm = input("Are you sure you want to quit? (Y/n): ").lower()
        if confirm in ['y', '']:
            return True
        elif confirm == 'n':
            return False

def cashier_session():
    while True:
        try:
            payment = float(input("\nEnter payment amount: $"))
            cost = float(input("Enter cost amount: $"))
            
            if payment < cost:
                print(f"Insufficient payment. Still need ${cost - payment:.2f}")
            else:
                calculate_total_change(payment, cost)
            
            repeat = input("\nEnter any number to continue or press Enter to quit: ").strip()
            
            if repeat == '':
                if confirm_quit():
                    print("\nSession ended.")
                    break
            
        except ValueError:
            print("Invalid input. Please enter numbers only.")
        except KeyboardInterrupt:
            print("\nSession interrupted.")
            if confirm_quit():
                print("\nSession ended.")
                break

print("=== Change Calculator ===")
cashier_session()
