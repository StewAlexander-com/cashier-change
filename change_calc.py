from change_logic import format_change_output


def calculate_total_change(payment_amount, cost):
    for line in format_change_output(payment_amount, cost):
        print(line)


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

def main():
    print("=== Change Calculator ===")
    cashier_session()


if __name__ == "__main__":
    main()
