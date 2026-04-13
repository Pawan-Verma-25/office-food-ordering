import Time "mo:core/Time";
import Debug "mo:core/Debug";
import List "mo:core/List";
import Runtime "mo:core/Runtime";



actor {
  public type Item = {
    itemName : Text;
    quantity : Nat;
    price : Nat;
    category : Text;
    restaurant : Text;
  };

  public type Order = {
    id : Nat;
    name : Text;
    department : Text;
    phone : Text;
    restaurantName : Text;
    items : [Item];
    totalAmount : Nat;
    timestamp : Int;
    paymentScreenshot : Text;
  };

  let orders = List.empty<Order>();
  var nextId : Nat = 1;

  // Normalize an item: if category is missing/blank, default to "Others"
  func normalizeItem(item : Item) : Item {
    let cat = if (item.category == "") { "Others" } else { item.category };
    { item with category = cat };
  };

  public shared func placeOrder(
    name : Text,
    department : Text,
    phone : Text,
    restaurantName : Text,
    items : [Item],
    totalAmount : Nat,
    paymentScreenshot : Text,
  ) : async Order {
    // Data validation
    if (name == "") { Runtime.trap("Order failed: name is required") };
    if (department == "") { Runtime.trap("Order failed: department is required") };
    if (phone == "") { Runtime.trap("Order failed: phone is required") };
    if (items.size() == 0) { Runtime.trap("Order failed: items cannot be empty") };

    // Payment validation
    if (paymentScreenshot == "") {
      Runtime.trap("Order failed: payment screenshot is required");
    };

    let ts = Time.now();

    // Duplicate prevention: same name + phone + timestamp (within same second = 1_000_000_000 ns)
    let isDuplicate = orders.find(func(o : Order) : Bool {
      o.name == name and o.phone == phone and (ts - o.timestamp < 1_000_000_000)
    });
    switch (isDuplicate) {
      case (?_) { Runtime.trap("Order failed: duplicate order detected") };
      case null {};
    };

    // Normalize item categories
    let normalizedItems = items.map(normalizeItem);

    let id = nextId;
    nextId += 1;

    let newOrder : Order = {
      id;
      name;
      department;
      phone;
      restaurantName;
      items = normalizedItems;
      totalAmount;
      timestamp = ts;
      paymentScreenshot;
    };
    orders.add(newOrder);
    Debug.print("Order saved successfully: id=" # debug_show(id) # " name=" # name # " phone=" # phone # " items=" # debug_show(items.size()));
    newOrder;
  };

  public query func getOrders() : async [Order] {
    Debug.print("Admin fetch: returning " # debug_show(orders.size()) # " orders");
    orders.toArray();
  };
};
